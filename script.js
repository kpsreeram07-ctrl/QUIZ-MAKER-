/**
 * Quiz Master - Interactive Quiz Application
 * Vanilla JavaScript implementation for question state, answer validation,
 * navigation, scoring, review, and restart logic.
 */

import {
  calculateScore,
  calculatePercentage,
  getPerformanceTier,
  formatQuestionCounter,
  calculateProgressPercentage,
  countAnsweredQuestions
} from './quiz-logic.mjs';

// ============================================================================
// 1. QUESTION DATABASE
// ============================================================================
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: "Astronomy",
    question: "Which planet in our solar system has the most extensive and visible ring system?",
    options: ["Jupiter", "Saturn", "Neptune", "Uranus"],
    correctAnswer: 1, // Saturn
    explanation: "Saturn possesses the most prominent ring system in our solar system, composed predominantly of billions of water-ice particles and rocky debris."
  },
  {
    id: 2,
    category: "Geography",
    question: "What is the longest river in the world by total length?",
    options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
    correctAnswer: 1, // Nile River
    explanation: "The Nile River in northeastern Africa flows for roughly 6,650 kilometers (4,132 miles), historically classified as the world's longest river."
  },
  {
    id: 3,
    category: "Science & Nature",
    question: "What chemical element is the most abundant gas in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correctAnswer: 2, // Nitrogen
    explanation: "Nitrogen makes up approximately 78.08% of Earth's atmosphere by volume, followed by oxygen at approximately 20.95%."
  },
  {
    id: 4,
    category: "World History",
    question: "Which ancient civilization constructed the magnificent city of Machu Picchu high in the Andes?",
    options: ["The Maya", "The Aztecs", "The Incas", "The Olmecs"],
    correctAnswer: 2, // The Incas
    explanation: "Machu Picchu was built in the 15th century by the Inca Empire under Emperor Pachacuti, located in modern-day Peru."
  },
  {
    id: 5,
    category: "Art & Culture",
    question: "Who painted the iconic masterpiece 'Girl with a Pearl Earring' during the Dutch Golden Age?",
    options: ["Johannes Vermeer", "Rembrandt van Rijn", "Vincent van Gogh", "Frans Hals"],
    correctAnswer: 0, // Johannes Vermeer
    explanation: "Dutch master Johannes Vermeer completed 'Girl with a Pearl Earring' around 1665, admired worldwide for its luminous treatment of light and expression."
  },
  {
    id: 6,
    category: "Technology",
    question: "Who is widely credited with proposing and inventing the World Wide Web in 1989 while at CERN?",
    options: ["Alan Turing", "Tim Berners-Lee", "Vint Cerf", "Marc Andreessen"],
    correctAnswer: 1, // Tim Berners-Lee
    explanation: "English computer scientist Sir Tim Berners-Lee invented the World Wide Web in 1989, creating the first web browser and server specifications."
  },
  {
    id: 7,
    category: "Earth & Oceans",
    question: "What is the deepest known oceanic trench on planet Earth?",
    options: ["Puerto Rico Trench", "Java Trench", "Mariana Trench", "Tonga Trench"],
    correctAnswer: 2, // Mariana Trench
    explanation: "The Mariana Trench in the western Pacific Ocean reaches a maximum depth of approximately 10,994 meters (36,070 feet) at the Challenger Deep."
  },
  {
    id: 8,
    category: "Physics & Chemistry",
    question: "What is the only metal that is liquid at standard room temperature and pressure?",
    options: ["Gallium", "Mercury", "Bromine", "Cesium"],
    correctAnswer: 1, // Mercury
    explanation: "Mercury (Hg) is the only elemental metal that is liquid at standard room temperature and pressure. (Bromine is also liquid at room temp, but is a halogen nonmetal)."
  },
  {
    id: 9,
    category: "World Literature",
    question: "Which classic 19th-century novel begins with: 'It is a truth universally acknowledged...'?",
    options: ["Jane Eyre", "Wuthering Heights", "Pride and Prejudice", "Middlemarch"],
    correctAnswer: 2, // Pride and Prejudice
    explanation: "Jane Austen opened her celebrated 1813 romantic novel 'Pride and Prejudice' with this renowned satirical sentence."
  },
  {
    id: 10,
    category: "Biology",
    question: "Which organ in the human body consumes the largest percentage of total oxygen and energy at rest?",
    options: ["Liver", "Heart", "Brain", "Lungs"],
    correctAnswer: 2, // Brain
    explanation: "Despite representing only about 2% of total human body mass, the human brain consumes around 20% of resting metabolic energy and oxygen."
  }
];

// ============================================================================
// 2. STATE VARIABLES
// ============================================================================
let currentQuestionIndex = 0;
// Stores user selected option index (0..3) or null if unanswered
let userAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);
let isReviewExpanded = false;

// ============================================================================
// 3. DOM ELEMENT REFERENCES
// ============================================================================
const elements = {
  // Screens
  welcomeScreen: document.getElementById('welcome-screen'),
  quizScreen: document.getElementById('quiz-screen'),
  resultsScreen: document.getElementById('results-screen'),

  // Welcome Screen Controls
  startQuizBtn: document.getElementById('start-quiz-btn'),

  // Quiz Screen Controls
  questionCounter: document.getElementById('question-counter'),
  answeredIndicator: document.getElementById('answered-indicator'),
  progressBarContainer: document.getElementById('progress-bar-container'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  questionCategory: document.getElementById('question-category'),
  questionText: document.getElementById('question-text'),
  optionsGroup: document.getElementById('options-group'),
  selectionWarning: document.getElementById('selection-warning'),
  prevQuestionBtn: document.getElementById('prev-question-btn'),
  nextQuestionBtn: document.getElementById('next-question-btn'),
  nextBtnText: document.getElementById('next-btn-text'),

  // Results Screen Controls
  performanceTitle: document.getElementById('performance-title'),
  performanceMessage: document.getElementById('performance-message'),
  finalPercentage: document.getElementById('final-percentage'),
  finalScoreText: document.getElementById('final-score-text'),
  correctCountText: document.getElementById('correct-count-text'),
  incorrectCountText: document.getElementById('incorrect-count-text'),
  scoreCircleBar: document.getElementById('score-circle-bar'),
  reviewAnswersBtn: document.getElementById('review-answers-btn'),
  reviewBtnText: document.getElementById('review-btn-text'),
  reviewSection: document.getElementById('review-section'),
  reviewItemsContainer: document.getElementById('review-items-container'),
  restartQuizBtn: document.getElementById('restart-quiz-btn')
};

// ============================================================================
// 4. SCREEN NAVIGATION FUNCTIONS
// ============================================================================

/**
 * Transitions from any screen to a target screen cleanly with ARIA attributes.
 */
function showScreen(targetScreen) {
  [elements.welcomeScreen, elements.quizScreen, elements.resultsScreen].forEach(screen => {
    if (screen === targetScreen) {
      screen.hidden = false;
      screen.classList.add('active');
    } else {
      screen.hidden = true;
      screen.classList.remove('active');
    }
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Starts or restarts the quiz flow from question 1.
 */
function startQuiz() {
  currentQuestionIndex = 0;
  userAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);
  showScreen(elements.quizScreen);
  renderQuestion(currentQuestionIndex);
}

// ============================================================================
// 5. QUESTION RENDERING & OPTION SELECTION
// ============================================================================

/**
 * Renders the question at the specified index, preserving previous user answers.
 */
function renderQuestion(index) {
  const q = QUIZ_QUESTIONS[index];
  if (!q) return;

  // Update Question Counter and Category
  elements.questionCounter.textContent = formatQuestionCounter(index, QUIZ_QUESTIONS.length);
  elements.questionCategory.textContent = q.category;
  elements.questionText.textContent = q.question;

  // Update Answered Indicator
  const answeredCount = countAnsweredQuestions(userAnswers, QUIZ_QUESTIONS.length);
  elements.answeredIndicator.textContent = `${answeredCount} of ${QUIZ_QUESTIONS.length} answered`;

  // Update Progress Bar
  const progressPercent = calculateProgressPercentage(index, QUIZ_QUESTIONS.length);
  elements.progressBarFill.style.width = `${progressPercent}%`;
  elements.progressBarContainer.setAttribute('aria-valuenow', progressPercent);

  // Clear previous options
  elements.optionsGroup.innerHTML = '';
  elements.selectionWarning.hidden = true;

  const optionLetters = ['A', 'B', 'C', 'D'];

  // Render 4 interactive options
  q.options.forEach((optText, optIndex) => {
    const isSelected = userAnswers[index] === optIndex;

    const optButton = document.createElement('button');
    optButton.type = 'button';
    optButton.className = `option-btn ${isSelected ? 'selected' : ''}`;
    optButton.setAttribute('role', 'radio');
    optButton.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    optButton.setAttribute('data-option-index', optIndex);

    optButton.innerHTML = `
      <div class="option-btn-content">
        <span class="option-key" aria-hidden="true">${optionLetters[optIndex]}</span>
        <span class="option-label">${optText}</span>
      </div>
      <div class="option-check" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;

    optButton.addEventListener('click', () => {
      selectOption(optIndex);
    });

    elements.optionsGroup.appendChild(optButton);
  });

  // Navigation button states
  // Previous button: disabled on question 0
  elements.prevQuestionBtn.disabled = index === 0;

  // Next/Submit button label
  const isFinalQuestion = index === QUIZ_QUESTIONS.length - 1;
  if (isFinalQuestion) {
    elements.nextBtnText.textContent = "Submit Quiz";
  } else {
    elements.nextBtnText.textContent = "Next Question";
  }
}

/**
 * Handles user selecting an option for the current question.
 */
function selectOption(optIndex) {
  // Save answer
  userAnswers[currentQuestionIndex] = optIndex;

  // Update active styling across option buttons
  const buttons = elements.optionsGroup.querySelectorAll('.option-btn');
  buttons.forEach((btn, idx) => {
    const isSelected = idx === optIndex;
    btn.classList.toggle('selected', isSelected);
    btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // Update answered count
  const answeredCount = countAnsweredQuestions(userAnswers, QUIZ_QUESTIONS.length);
  elements.answeredIndicator.textContent = `${answeredCount} of ${QUIZ_QUESTIONS.length} answered`;

  // Dismiss validation warning
  elements.selectionWarning.hidden = true;
}

/**
 * Validates selection and advances to next question or submits quiz.
 */
function handleNextQuestion() {
  // Validation check: User must select an answer to advance
  if (userAnswers[currentQuestionIndex] === null) {
    elements.selectionWarning.hidden = false;
    // Re-trigger animation
    elements.selectionWarning.classList.remove('shake');
    void elements.selectionWarning.offsetWidth; // reflow
    elements.selectionWarning.classList.add('shake');
    return;
  }

  elements.selectionWarning.hidden = true;

  // If this was the last question, submit the quiz
  if (currentQuestionIndex === QUIZ_QUESTIONS.length - 1) {
    submitQuiz();
  } else {
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
  }
}

/**
 * Handles navigating back to the previous question.
 */
function handlePrevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion(currentQuestionIndex);
  }
}

// ============================================================================
// 6. SCORING & RESULTS DISPLAY
// ============================================================================

/**
 * Calculates final score, displays results, and configures the review view.
 */
function submitQuiz() {
  const totalQuestions = QUIZ_QUESTIONS.length;
  const score = calculateScore(userAnswers, QUIZ_QUESTIONS);
  const percentage = calculatePercentage(score, totalQuestions);
  const tier = getPerformanceTier(percentage);

  // Switch to Results Screen
  showScreen(elements.resultsScreen);

  // Populate Performance Content
  elements.performanceTitle.textContent = tier.title;
  elements.performanceMessage.textContent = tier.message;
  elements.finalScoreText.textContent = `${score} of ${totalQuestions}`;
  elements.correctCountText.textContent = score;
  elements.incorrectCountText.textContent = totalQuestions - score;
  elements.finalPercentage.textContent = `${percentage}%`;

  // Animate Circular Gauge
  // Circumference of r=50 is 2 * PI * 50 = ~314.16
  const circumference = 314.16;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Set initial empty state then transition
  elements.scoreCircleBar.style.strokeDashoffset = `${circumference}`;
  
  // Choose stroke color based on tier
  if (percentage >= 80) {
    elements.scoreCircleBar.style.stroke = "var(--success)";
  } else if (percentage >= 50) {
    elements.scoreCircleBar.style.stroke = "var(--primary)";
  } else {
    elements.scoreCircleBar.style.stroke = "var(--danger)";
  }

  setTimeout(() => {
    elements.scoreCircleBar.style.strokeDashoffset = `${offset}`;
  }, 100);

  // Populate Review Cards
  renderReviewCards();

  // Reset review toggle state
  isReviewExpanded = false;
  elements.reviewSection.hidden = true;
  elements.reviewAnswersBtn.setAttribute('aria-expanded', 'false');
  elements.reviewBtnText.textContent = "Review Answers";
}

/**
 * Generates the list of questions, selected answers, correct answers, and explanations.
 */
function renderReviewCards() {
  elements.reviewItemsContainer.innerHTML = '';
  const optionLetters = ['A', 'B', 'C', 'D'];

  QUIZ_QUESTIONS.forEach((q, idx) => {
    const userChoiceIndex = userAnswers[idx];
    const isCorrect = userChoiceIndex === q.correctAnswer;
    const userChoiceText = userChoiceIndex !== null && userChoiceIndex !== undefined
      ? `${optionLetters[userChoiceIndex]}. ${q.options[userChoiceIndex]}`
      : "Not answered";
    const correctChoiceText = `${optionLetters[q.correctAnswer]}. ${q.options[q.correctAnswer]}`;

    const card = document.createElement('article');
    card.className = `review-card ${isCorrect ? 'is-correct' : 'is-incorrect'}`;

    card.innerHTML = `
      <div class="review-card-top">
        <span class="review-question-index">Question ${idx + 1} of ${QUIZ_QUESTIONS.length} · ${q.category}</span>
        <span class="review-status-badge ${isCorrect ? 'correct' : 'incorrect'}">
          ${isCorrect 
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> Correct`
            : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Incorrect`
          }
        </span>
      </div>

      <h3 class="review-question-text">${q.question}</h3>

      <div class="review-answers-grid">
        <div class="review-answer-row">
          <span class="review-answer-label">Your Answer:</span>
          <span class="review-answer-val ${isCorrect ? 'val-correct' : 'val-incorrect'}">${userChoiceText}</span>
        </div>
        ${!isCorrect ? `
          <div class="review-answer-row">
            <span class="review-answer-label">Correct Answer:</span>
            <span class="review-answer-val val-correct">${correctChoiceText}</span>
          </div>
        ` : ''}
      </div>

      <div class="review-explanation">
        <div class="review-explanation-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div>
          <strong>Insight:</strong> ${q.explanation}
        </div>
      </div>
    `;

    elements.reviewItemsContainer.appendChild(card);
  });
}

/**
 * Toggles the review panel visibility.
 */
function toggleReview() {
  isReviewExpanded = !isReviewExpanded;
  elements.reviewSection.hidden = !isReviewExpanded;
  elements.reviewAnswersBtn.setAttribute('aria-expanded', isReviewExpanded ? 'true' : 'false');
  elements.reviewBtnText.textContent = isReviewExpanded ? "Hide Review" : "Review Answers";

  if (isReviewExpanded) {
    elements.reviewSection.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Resets application state and returns to the Welcome Screen.
 */
function restartQuiz() {
  currentQuestionIndex = 0;
  userAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);
  isReviewExpanded = false;
  elements.reviewSection.hidden = true;
  elements.reviewAnswersBtn.setAttribute('aria-expanded', 'false');
  elements.reviewBtnText.textContent = "Review Answers";

  showScreen(elements.welcomeScreen);
}

// ============================================================================
// 7. KEYBOARD SHORTCUTS & EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Button Clicks
  elements.startQuizBtn.addEventListener('click', startQuiz);
  elements.nextQuestionBtn.addEventListener('click', handleNextQuestion);
  elements.prevQuestionBtn.addEventListener('click', handlePrevQuestion);
  elements.reviewAnswersBtn.addEventListener('click', toggleReview);
  elements.restartQuizBtn.addEventListener('click', restartQuiz);

  // Keyboard navigation on Quiz Screen
  document.addEventListener('keydown', (e) => {
    // Only handle keyboard shortcuts if the quiz screen is currently active
    if (elements.quizScreen.hidden) return;

    // Keys 1, 2, 3, 4 or A, B, C, D (case-insensitive) to choose options
    const key = e.key.toUpperCase();
    if (key === '1' || key === 'A') {
      selectOption(0);
    } else if (key === '2' || key === 'B') {
      selectOption(1);
    } else if (key === '3' || key === 'C') {
      selectOption(2);
    } else if (key === '4' || key === 'D') {
      selectOption(3);
    } else if (e.key === 'Enter') {
      // Prevent default form submits and trigger next
      e.preventDefault();
      handleNextQuestion();
    } else if (e.key === 'ArrowLeft') {
      if (!elements.prevQuestionBtn.disabled) {
        handlePrevQuestion();
      }
    } else if (e.key === 'ArrowRight') {
      handleNextQuestion();
    }
  });
}

// ============================================================================
// 8. INITIALIZATION
// ============================================================================

function init() {
  setupEventListeners();

  // Support ?autostart=1 to jump straight into Question 1 (per Ultra-mode instructions)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('autostart') === '1') {
    startQuiz();
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
