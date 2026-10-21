# TODO - Emotion-Based Break Notification System

## Task: Show break notification when user is sad, with duration based on expression duration

### Steps to Complete:

1. [x] **Modify useEmotionDetection.js** - Export emotion detection logic to track consecutive sad emotion duration
2. [x] **Modify Lesson.js** - Add logic to track sad emotion duration and trigger break notification
3. [x] **Implement notification UI** - Add toast/notification in Lesson.js header for break suggestions
4. [x] **Implement BreakScreen integration** - Navigate to break with appropriate duration (2min or 4min based on sad duration)

### Implementation Details:

**Sad Detection Logic:**
- Track consecutive frames with "Sad" emotion (each frame = 500ms)
- If sad for 10-20 seconds (10-20 frames) → Suggest 2 min break
- If sad for 20+ seconds (40+ frames) → Suggest 4 min break

**Notification UI:**
- Show notification icon with badge when sad detected
- Click notification or auto-prompt to take break
- Option to dismiss or take the suggested break

