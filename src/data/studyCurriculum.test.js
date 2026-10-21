import { lessonContent } from './lessonContent';
import {
  getLessonProgressKey,
  getStudySubjectByLegacyName,
  resolveStudyLessonRoute,
  slugifyStudyId,
  studyCatalog,
} from './studyCurriculum';

describe('Study curriculum routes', () => {
  test('contains the eight catalogue subjects', () => {
    expect(studyCatalog.map((subject) => subject.slug)).toEqual([
      'artificial-intelligence',
      'machine-learning',
      'programming-fundamentals',
      'data-science',
      'data-structures-algorithms',
      'database-management',
      'web-development',
      'computer-systems-networks',
    ]);
  });

  test('every available lesson has a unique stable slug and lesson content', () => {
    studyCatalog.forEach((subject) => {
      const lessonSlugs = subject.modules.flatMap((module) => module.lessons.map(slugifyStudyId));
      expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
      subject.modules.flatMap((module) => module.lessons).forEach((name) => {
        expect(lessonContent[name]?.sections?.length).toBeGreaterThan(0);
        expect(resolveStudyLessonRoute(subject.slug, slugifyStudyId(name))?.lesson?.name).toBe(name);
      });
    });
  });

  test('resolves the requested machine-learning lesson and neighboring lesson', () => {
    const current = resolveStudyLessonRoute('machine-learning', 'introduction-to-ml');
    expect(current.lesson.name).toBe('Introduction to ML');
    expect(current.lesson.moduleTitle).toBe('Machine Learning Foundations');
    expect(current.lessons[current.lessonIndex + 1].name).toBe('Linear Regression');

    const next = resolveStudyLessonRoute('machine-learning', 'linear-regression');
    expect(next.lesson.name).toBe('Linear Regression');
    expect(lessonContent[next.lesson.name]).not.toBe(lessonContent[current.lesson.name]);
  });

  test('does not resolve unknown subjects or unavailable lessons', () => {
    expect(resolveStudyLessonRoute('unknown-subject', 'anything')).toBeNull();
    expect(resolveStudyLessonRoute('artificial-intelligence', 'introduction-to-ai').lesson).toBeNull();
  });

  test('uses the existing subject key format for user progress', () => {
    expect(getLessonProgressKey(
      studyCatalog.find((subject) => subject.slug === 'data-structures-algorithms'),
      'Stack'
    )).toBe('Data Structures-Stack');
  });

  test('maps legacy topic-picker subjects to the shared curriculum', () => {
    expect(getStudySubjectByLegacyName('Algorithms').slug).toBe('data-structures-algorithms');
    expect(getStudySubjectByLegacyName('Database Systems').slug).toBe('database-management');
    expect(getStudySubjectByLegacyName('Operating Systems').slug).toBe('computer-systems-networks');
    expect(getStudySubjectByLegacyName('Unknown Subject')).toBeUndefined();
  });
});
