// Topic-specific walkthroughs + beginner-friendly explanations.
// Generic fallback builder keeps every lesson functional.
const walkthroughFor = (lessonName) => ({
  Classification: {
    title: 'Walkthrough: Pass or Needs Improvement?',
    intro: 'A classification model receives features (inputs) and predicts a category (label). This is an educational illustration, not a trained model.',
    steps: [
      'Inputs: study hours per day and attendance percentage for each student.',
      'Labelled examples: past students tagged Pass or Needs Improvement.',
      'Training: the model adjusts a decision boundary to separate the two groups.',
      'Prediction: a new student (4h study, 90% attendance) falls on the Pass side, so the model predicts Pass.',
      'Check: compare predictions on held-out students; mistakes guide more examples or better features.',
    ],
  },
  'Linear Regression': {
    title: 'Walkthrough: predicting a study score',
    intro: 'Regression predicts a continuous number. This is an educational illustration.',
    steps: [
      'Inputs: hours studied (x). Output: expected score (y).',
      'Model: y = m*x + c. Start with a guess for slope m and intercept c.',
      'Error: mean squared error between predictions and real scores.',
      'Fit: adjust m and c to minimize the error.',
      'Predict: 5 hours -> y = m*5 + c gives the estimated score.',
    ],
  },
  Stack: {
    title: 'Walkthrough: plates in a canteen',
    intro: 'A stack is Last In, First Out — like plates you can only take from the top.',
    steps: [
      'push(plate A), push(plate B), push(plate C): C is now on top.',
      'pop() removes C first, then B — last in, first out.',
      'peek() looks at the top without removing it.',
      'Use: undo buttons, browser back, function calls.',
    ],
  },
}[lessonName] || {
  title: `Walkthrough: ${lessonName}`,
  intro: 'Work through this topic in small steps using the lesson sections below.',
  steps: [
    'Read the first section and restate its key idea in one sentence.',
    'Find the worked example or diagram in the lesson and trace it by hand.',
    'Cover the explanation and try to recall each step.',
    'Attempt one practice question, then check what went wrong.',
  ],
});

const simplifyFor = (lessonName) => ({
  Classification: {
    analogy: 'Sorting fruit: apples vs oranges by colour and size — the rule you learn is the decision boundary.',
    simple: 'Classification = putting things into labelled boxes using past examples. Binary = two boxes (spam / not spam). Multi-class = many boxes.',
    example: 'Email filters learn from thousands of labelled emails, then guess the box for each new email.',
  },
  'Linear Regression': {
    analogy: 'Drawing the straightest line through scattered dots on a graph.',
    simple: 'Regression = guessing a number from a pattern. The line y = m*x + c is the pattern; m is steepness, c is the starting point.',
    example: 'More study hours usually means a higher score — the line captures that trend.',
  },
  Stack: {
    analogy: 'A stack of plates: you add and remove from the top only.',
    simple: 'Stack = Last In, First Out. push adds, pop removes, peek looks.',
    example: 'Undo (Ctrl+Z) pops your most recent change first.',
  },
}[lessonName] || {
  analogy: 'Think of it like learning a recipe: ingredients (inputs), steps (process), dish (output).',
  simple: `The core idea of ${lessonName}: break it into inputs, a repeatable process, and an expected output. Read each lesson section with that lens.`,
  example: 'Pick one example from the lesson below and explain it aloud in your own words.',
});

export const getWalkthrough = (lessonName) => walkthroughFor(lessonName);
export const getSimplified = (lessonName) => simplifyFor(lessonName);
export const lessonHas = () => true; // walkthrough/simplified available for every lesson via fallback
