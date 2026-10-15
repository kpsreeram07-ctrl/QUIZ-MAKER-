/**
 * Pure quiz logic functions decoupled for testing and maintainability.
 */

export function calculateScore(userAnswers, questions) {
  if (!Array.isArray(userAnswers) || !Array.isArray(questions)) return 0;
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] !== undefined && userAnswers[i] !== null) {
      if (userAnswers[i] === questions[i].correctAnswer) {
        score++;
      }
    }
  }
  return score;
}

export function calculatePercentage(score, total) {
  if (!total || total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function getPerformanceTier(percentage) {
  if (percentage >= 90) {
    return {
      title: "Mastermind Status",
      badge: "Exceptional",
      message: "Outstanding performance! You possess an extraordinary depth of general knowledge.",
      accentClass: "text-emerald-400"
    };
  } else if (percentage >= 70) {
    return {
      title: "Great Job!",
      badge: "Proficient",
      message: "Impressive knowledge! You navigated through varied domains with strong accuracy.",
      accentClass: "text-blue-400"
    };
  } else if (percentage >= 50) {
    return {
      title: "Solid Effort!",
      badge: "Good Try",
      message: "Good run! You have a solid grasp of trivia, with room for just a bit more polish.",
      accentClass: "text-amber-400"
    };
  } else {
    return {
      title: "Keep Exploring!",
      badge: "Learning",
      message: "Practice makes perfect! Check out the explanations below and try another round.",
      accentClass: "text-rose-400"
    };
  }
}

export function formatQuestionCounter(currentIndex, totalQuestions) {
  const current = Math.max(1, Math.min(currentIndex + 1, totalQuestions));
  return `Question ${current} of ${totalQuestions}`;
}

export function calculateProgressPercentage(currentIndex, totalQuestions) {
  if (!totalQuestions || totalQuestions <= 0) return 0;
  return Math.round(((currentIndex + 1) / totalQuestions) * 100);
}

export function countAnsweredQuestions(userAnswers, totalQuestions) {
  if (!Array.isArray(userAnswers)) return 0;
  let count = 0;
  for (let i = 0; i < totalQuestions; i++) {
    if (userAnswers[i] !== undefined && userAnswers[i] !== null && userAnswers[i] !== -1) {
      count++;
    }
  }
  return count;
}
