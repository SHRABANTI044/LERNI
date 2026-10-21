// Unit tests for the local recommendation rules (no webcam, no backend).
import { buildLearningRecommendation, BREAK_DURATION_SECONDS, NOT_NOW_COOLDOWN_MS } from './learningRecommendations';

describe('learningRecommendations', () => {
  test('quiz difficulty drives revision suggestion', () => {
    const rec = buildLearningRecommendation({
      lessonId: 'Linear Regression',
      quizStats: { attempts: 1, recentScore: 40, incorrectCount: 3, weakTopics: ['Linear Regression'] },
    });
    expect(rec?.type).toBe('review');
    expect(rec.message).toMatch(/more practice|revisit/i);
  });

  test('strong quiz performance offers challenge/next', () => {
    const rec = buildLearningRecommendation({
      lessonId: 'Stack',
      quizStats: { attempts: 1, recentScore: 100, incorrectCount: 0, weakTopics: [] },
    });
    expect(rec?.type).toBe('challenge');
  });

  test('single uncertain emotion frame produces no claim', () => {
    const rec = buildLearningRecommendation({
      lessonId: 'Stack',
      emotionSupportEnabled: true,
      smoothedEmotion: { emotion: 'Sad', confidence: 50, frames: 1, lastSeen: Date.now() },
    });
    expect(rec).toBeNull();
  });

  test('sustained difficulty signal offers walkthrough tentatively', () => {
    const rec = buildLearningRecommendation({
      lessonId: 'Classification',
      emotionSupportEnabled: true,
      smoothedEmotion: { emotion: 'Sad', confidence: 70, frames: 4, lastSeen: Date.now() },
      hasWalkthrough: true,
      hasSimplerExplanation: true,
    });
    expect(rec?.type).toBe('simpler');
    expect(rec.title).toMatch(/walkthrough/i);
    expect(rec.actions).toContain('walkthrough');
  });

  test('frustration signal offers another approach plus break option', () => {
    const rec = buildLearningRecommendation({
      lessonId: 'Classification',
      emotionSupportEnabled: true,
      smoothedEmotion: { emotion: 'Angry', confidence: 70, frames: 4, lastSeen: Date.now() },
    });
    expect(rec?.type).toBe('simpler');
    expect(rec.actions).toContain('break');
  });

  test('explicit break request works without webcam', () => {
    const rec = buildLearningRecommendation({ lessonId: 'Stack', breakRequested: true });
    expect(rec?.type).toBe('break');
    expect(BREAK_DURATION_SECONDS).toBe(300);
  });

  test('Not Now cooldown suppresses repeats; dismiss stays silent', () => {
    const now = Date.now();
    const cooling = buildLearningRecommendation({
      lessonId: 'Stack',
      quizStats: { attempts: 1, recentScore: 20, incorrectCount: 4, weakTopics: ['Stack'] },
      cooldowns: { review: now },
      now,
    });
    expect(cooling).toBeNull();
    expect(NOT_NOW_COOLDOWN_MS).toBeGreaterThan(0);
  });

  test('dismissed and paused suggestions stay silent', () => {
    const dismissed = buildLearningRecommendation({
      lessonId: 'Stack',
      quizStats: { attempts: 1, recentScore: 20, incorrectCount: 4, weakTopics: ['Stack'] },
      dismissedTypes: ['review'],
    });
    expect(dismissed).toBeNull();
    const paused = buildLearningRecommendation({
      lessonId: 'Stack',
      quizStats: { attempts: 1, recentScore: 20, incorrectCount: 4, weakTopics: ['Stack'] },
      suggestionsPaused: true,
    });
    expect(paused).toBeNull();
  });
});
