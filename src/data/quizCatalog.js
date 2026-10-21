import { lessonContent } from './lessonContent';
import { getLegacySubjectName, slugifyStudyId, studyCatalog } from './studyCurriculum';

// Central quiz catalogue. Question counts & difficulty are derived from the
// actual legacy quiz bank in components/Quiz.js (5 questions per topic) and
// the difficulty labels in components/TopicSelection.js. Availability is
// derived from real lesson content so we never invent quizzes.
const TOPIC_DIFFICULTY = {
  Stack: 'Easy', Queue: 'Easy', 'Linked List': 'Medium', 'Binary Tree': 'Medium',
  'Hash Table': 'Medium', Graph: 'Hard',
  'Bubble Sort': 'Easy', 'Binary Search': 'Easy', 'Quick Sort': 'Medium',
  'Merge Sort': 'Medium', 'Dynamic Programming': 'Hard', 'Greedy Algorithms': 'Hard',
  'Introduction to ML': 'Easy', 'Linear Regression': 'Easy', Classification: 'Medium',
  'Neural Networks': 'Medium', 'Deep Learning': 'Hard', 'Natural Language Processing': 'Hard',
  'HTML Basics': 'Easy', 'CSS Styling': 'Easy', 'JavaScript Fundamentals': 'Medium',
  'React Components': 'Medium', 'REST APIs': 'Medium', 'Authentication & Security': 'Hard',
  'SQL Basics': 'Easy', 'Database Design': 'Easy', 'Joins & Relationships': 'Medium',
  'Indexing & Optimization': 'Medium', 'Transactions & ACID': 'Hard', 'NoSQL Databases': 'Medium',
  'OS Introduction': 'Easy', 'Process Management': 'Easy', 'Memory Management': 'Medium',
  'File Systems': 'Medium', Deadlocks: 'Hard', 'Virtual Memory': 'Hard',
};

// Legacy subject names used as keys in the Quiz.js question bank.
const QUIZ_SUBJECTS = {
  'Data Structures': ['Stack', 'Queue', 'Linked List', 'Binary Tree', 'Hash Table', 'Graph'],
  Algorithms: ['Bubble Sort', 'Binary Search', 'Quick Sort', 'Merge Sort', 'Dynamic Programming', 'Greedy Algorithms'],
  'Machine Learning': ['Introduction to ML', 'Linear Regression', 'Classification', 'Neural Networks', 'Deep Learning', 'Natural Language Processing'],
  'Web Development': ['HTML Basics', 'CSS Styling', 'JavaScript Fundamentals', 'React Components', 'REST APIs', 'Authentication & Security'],
  'Database Systems': ['SQL Basics', 'Database Design', 'Joins & Relationships', 'Indexing & Optimization', 'Transactions & ACID', 'NoSQL Databases'],
  'Operating Systems': ['OS Introduction', 'Process Management', 'Memory Management', 'File Systems', 'Deadlocks', 'Virtual Memory'],
};

export const getQuizId = (subjectName, topicName) =>
  `${slugifyStudyId(subjectName)}--${slugifyStudyId(topicName)}`;

// Build the catalogue from real lesson availability.
export const quizCatalog = Object.entries(QUIZ_SUBJECTS).flatMap(([quizSubject, topics]) => {
  const studySubject = studyCatalog.find(
    (s) => s.name === quizSubject || getLegacySubjectName(s) === quizSubject
  );
  const availableLessons = new Set(
    (studySubject?.modules || []).flatMap((m) => m.lessons)
  );
  return topics
    .filter((topic) => lessonContent[topic]?.sections?.length && availableLessons.has(topic))
    .map((topic) => {
      const lessonSlug = studySubject ? slugifyStudyId(topic) : null;
      return {
        id: getQuizId(quizSubject, topic),
        subject: quizSubject,
        topic,
        questionCount: 5,
        difficulty: TOPIC_DIFFICULTY[topic] || 'Mixed',
        studySubjectSlug: studySubject?.slug || null,
        studySubjectName: studySubject?.name || quizSubject,
        lessonSlug,
        lessonRoute: studySubject && lessonSlug
          ? `/study/${studySubject.slug}/lessons/${lessonSlug}`
          : '/study',
      };
    });
});

export const getQuizById = (id) => quizCatalog.find((q) => q.id === id) || null;

// Resolve a quiz from legacy subject/topic names (the names used by the
// original question bank in src/data/quizBank.js).
export const getQuizBySubjectTopic = (subjectName, topicName) => {
  if (!subjectName || !topicName) return null;
  const subject = String(subjectName);
  const topic = String(topicName);
  return quizCatalog.find(
    (q) => (q.subject === subject || q.studySubjectName === subject) && q.topic === topic
  ) || null;
};

// Resolve the quiz for a Study lesson page (subject object + lesson name).
export const getQuizForStudyLesson = (subject, lessonName) => {
  if (!subject || !lessonName) return null;
  const legacy = getLegacySubjectName(subject);
  const candidates = [
    `${slugifyStudyId(legacy)}--${slugifyStudyId(lessonName)}`,
    `${slugifyStudyId(subject.name)}--${slugifyStudyId(lessonName)}`,
  ];
  // Data Structures & Algorithms catalogue splits DS vs Algorithms topics.
  if (subject.slug === 'data-structures-algorithms') {
    const dsTopics = QUIZ_SUBJECTS['Data Structures'];
    const key = dsTopics.includes(lessonName) ? 'data-structures' : 'algorithms';
    return getQuizById(`${key}--${slugifyStudyId(lessonName)}`);
  }
  for (const id of candidates) {
    const found = getQuizById(id);
    if (found) return found;
  }
  return null;
};

export const quizSubjects = [...new Set(quizCatalog.map((q) => q.subject))].sort();
