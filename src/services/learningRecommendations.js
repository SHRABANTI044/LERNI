// Local, explainable recommendation rules. Never claims emotions prove feelings.
// Priority: 1) explicit student choices, 2) quiz difficulty, 3) sustained
// uncertain expression signals, 4) break requests, 5) strong quiz performance.
const DIFFICULTY_SIGNALS = ['Sad', 'Angry', 'Fearful', 'Disgusted'];
const FRUSTRATION_SIGNALS = ['Angry', 'Disgusted', 'Fearful'];
const BREAK_SIGNALS = ['Sad'];
const POSITIVE_SIGNALS = ['Happy', 'Surprised'];

export const NOT_NOW_COOLDOWN_MS = 5 * 60 * 1000;
export const BREAK_DURATION_SECONDS = 300;

const minutesSince = (ts) => (Date.now() - ts) / 60000;

// cooldowns: { [type]: timestamp } — "Not Now" snoozes that type briefly.
const isCoolingDown = (cooldowns, type, now = Date.now()) => {
  const ts = cooldowns?.[type];
  return typeof ts === 'number' && now - ts < NOT_NOW_COOLDOWN_MS;
};

export const buildLearningRecommendation = ({
  lessonId,
  emotionSupportEnabled = false,
  smoothedEmotion = null, // { emotion, confidence, frames, lastSeen, sustainedSeconds }
  quizStats = null, // { attempts, averageScore, recentScore, incorrectCount, weakTopics[] }
  dismissedTypes = [],
  cooldowns = {},
  suggestionsPaused = false,
  breakRequested = false,
  hasSimplerExplanation = true,
  hasWalkthrough = true,
  hasQuiz = false,
  hasChallenge = false,
  now = Date.now(),
} = {}) => {
  if (suggestionsPaused) return null;
  const dismissed = new Set(dismissedTypes || []);

  // 1. Quiz difficulty is the MAIN revision signal (works without webcam).
  if (quizStats && (quizStats.incorrectCount >= 2 || (quizStats.recentScore != null && quizStats.recentScore < 60))) {
    if (!dismissed.has('review') && !isCoolingDown(cooldowns, 'review', now)) {
      const topic = quizStats.weakTopics?.[0] || lessonId;
      const actions = ['review', 'example'];
      if (hasQuiz) actions.push('practice');
      actions.push('continue');
      return {
        type: 'review',
        title: "Let's review this concept",
        message: `Your recent answers suggest "${topic}" needs a little more practice. Would you like to revisit it before moving on?`,
        actions,
        reason: 'quiz',
      };
    }
  }

  // 2. Sustained uncertain difficulty signal -> tentative walkthrough/simplify/quiz.
  if (emotionSupportEnabled && smoothedEmotion && DIFFICULTY_SIGNALS.includes(smoothedEmotion.emotion) && smoothedEmotion.confidence >= 45 && smoothedEmotion.frames >= 3) {
    const isFrustration = FRUSTRATION_SIGNALS.includes(smoothedEmotion.emotion);
    if (!dismissed.has('simpler') && !isCoolingDown(cooldowns, 'simpler', now) && minutesSince(smoothedEmotion.lastSeen || now) < 10) {
      const actions = [];
      if (hasWalkthrough) actions.push('walkthrough');
      if (hasSimplerExplanation) actions.push('simpler');
      if (hasQuiz) actions.push('practice');
      if (isFrustration) actions.push('break');
      actions.push('later');
      return {
        type: 'simpler',
        title: isFrustration
          ? 'Would you like to try another approach?'
          : `Would a walkthrough help with ${lessonId || 'this topic'}?`,
        message: isFrustration
          ? 'You can explore a different explanation, a step-by-step example, or take a short break. This is optional.'
          : 'You can explore a step-by-step example or try another explanation. Expression estimates are uncertain, so this is only a suggestion.',
        actions,
        reason: 'emotion+optional',
      };
    }
  }

  // 3. Breaks: explicit request wins; otherwise only sustained uncertain Sad.
  if (!dismissed.has('break') && !isCoolingDown(cooldowns, 'break', now)) {
    if (breakRequested) {
      return {
        type: 'break',
        title: 'Time for a quick break?',
        message: 'You can pause for five minutes and return when you are ready. Your lesson and progress are preserved.',
        actions: ['break', 'continue'],
        reason: 'student-request',
      };
    }
    if (emotionSupportEnabled && smoothedEmotion && BREAK_SIGNALS.includes(smoothedEmotion.emotion) && (smoothedEmotion.sustainedSeconds || 0) >= 20) {
      return {
        type: 'break',
        title: 'Time for a quick break?',
        message: 'You can pause for five minutes and return when you are ready. Your lesson and progress are preserved.',
        actions: ['break', 'continue'],
        reason: 'emotion-sustained',
      };
    }
  }

  // 4. Strong performance -> optional challenge (emotion never proves understanding).
  if (quizStats && quizStats.recentScore >= 85 && quizStats.attempts >= 1) {
    if (!dismissed.has('challenge') && !isCoolingDown(cooldowns, 'challenge', now)) {
      const actions = [];
      if (hasChallenge) actions.push('challenge');
      actions.push('next', 'later');
      return {
        type: 'challenge',
        title: 'Ready for a challenge?',
        message: 'Your quiz performance shows readiness. Would you like an extra challenge or the next lesson?',
        actions,
        reason: 'quiz',
      };
    }
  }

  // 5. Mild positive engagement -> nothing intrusive.
  if (emotionSupportEnabled && smoothedEmotion && POSITIVE_SIGNALS.includes(smoothedEmotion.emotion)) return null;

  return null;
};

export default buildLearningRecommendation;
