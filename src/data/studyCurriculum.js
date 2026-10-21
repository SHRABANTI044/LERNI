import { lessonContent } from './lessonContent';

const subjects = [
  {
    slug: 'artificial-intelligence', name: 'Artificial Intelligence', icon: 'brain', color: 'violet',
    description: 'Explore how intelligent systems reason, plan, and solve problems.',
    modules: [],
  },
  {
    slug: 'machine-learning', name: 'Machine Learning', icon: 'network', color: 'blue',
    description: 'Learn how data helps computer systems find patterns and make predictions.',
    modules: [{ title: 'Machine Learning Foundations', topics: ['Introduction to ML', 'Linear Regression', 'Classification', 'Neural Networks', 'Deep Learning', 'Natural Language Processing'] }],
  },
  {
    slug: 'programming-fundamentals', name: 'Programming Fundamentals', icon: 'code', color: 'mint',
    description: 'Build problem-solving skills and learn the foundations of writing programs.',
    modules: [],
  },
  {
    slug: 'data-science', name: 'Data Science', icon: 'chart', color: 'peach',
    description: 'Discover practical techniques for exploring and communicating with data.',
    modules: [],
  },
  {
    slug: 'data-structures-algorithms', name: 'Data Structures & Algorithms', icon: 'branch', color: 'indigo',
    description: 'Understand the structures and algorithms that power efficient software.',
    modules: [
      { title: 'Data Structures', topics: ['Stack', 'Queue', 'Linked List', 'Binary Tree', 'Hash Table', 'Graph'] },
      { title: 'Algorithms', topics: ['Bubble Sort', 'Binary Search', 'Quick Sort', 'Merge Sort', 'Dynamic Programming', 'Greedy Algorithms'] },
    ],
  },
  {
    slug: 'database-management', name: 'Database Management', icon: 'database', color: 'cyan',
    description: 'Learn how databases organize, query, and protect information.',
    modules: [{ title: 'Database Systems', topics: ['SQL Basics', 'Database Design', 'Joins & Relationships', 'Indexing & Optimization', 'Transactions & ACID', 'NoSQL Databases'] }],
  },
  {
    slug: 'web-development', name: 'Web Development', icon: 'monitor', color: 'pink',
    description: 'Create modern web experiences, from HTML and CSS to APIs.',
    modules: [{ title: 'Web Development', topics: ['HTML Basics', 'CSS Styling', 'JavaScript Fundamentals', 'React Components', 'REST APIs', 'Authentication & Security'] }],
  },
  {
    slug: 'computer-systems-networks', name: 'Computer Systems & Networks', icon: 'server', color: 'gold',
    description: 'Explore operating systems, processes, memory, and core system concepts.',
    modules: [{ title: 'Operating Systems', topics: ['OS Introduction', 'Process Management', 'Memory Management', 'File Systems', 'Deadlocks', 'Virtual Memory'] }],
  },
];

export const slugifyStudyId = (value) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export const studyCatalog = subjects.map((subject) => ({
  ...subject,
  modules: subject.modules.map((module) => ({
    ...module,
    lessons: module.topics.filter((topic) => lessonContent[topic]?.sections?.length),
  })).filter((module) => module.lessons.length),
}));

export const resolveStudyLessonRoute = (subjectSlug, lessonSlug) => {
  const subject = studyCatalog.find((item) => item.slug === subjectSlug);
  if (!subject) return null;

  const lessons = subject.modules.flatMap((module) => module.lessons.map((name) => ({
    name,
    slug: slugifyStudyId(name),
    moduleTitle: module.title,
  })));
  const lessonIndex = lessons.findIndex((item) => item.slug === lessonSlug);

  return {
    subject,
    lessons,
    lesson: lessonIndex >= 0 ? lessons[lessonIndex] : null,
    lessonIndex,
  };
};

const legacySubjectNames = {
  'data-structures-algorithms': 'Data Structures',
  'database-management': 'Database Systems',
  'computer-systems-networks': 'Operating Systems',
};

export const getLegacySubjectName = (subject) => legacySubjectNames[subject.slug] || subject.name;

export const getStudySubjectByLegacyName = (name) => studyCatalog.find((subject) => (
  subject.name === name
  || getLegacySubjectName(subject) === name
  || (subject.slug === 'data-structures-algorithms' && name === 'Algorithms')
));

export const getLessonProgressKey = (subject, lessonName) => `${getLegacySubjectName(subject)}-${lessonName}`;
