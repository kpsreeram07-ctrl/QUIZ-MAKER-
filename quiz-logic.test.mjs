import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  calculatePercentage,
  getPerformanceTier,
  formatQuestionCounter,
  calculateProgressPercentage,
  countAnsweredQuestions
} from './quiz-logic.mjs';

const mockQuestions = [
  { id: 1, correctAnswer: 2 },
  { id: 2, correctAnswer: 0 },
  { id: 3, correctAnswer: 3 },
  { id: 4, correctAnswer: 1 }
];

test('calculateScore accurately tracks correct responses and ignores nulls', () => {
  const userAnswers = [2, 0, 1, 1]; // #1 correct (2), #2 correct (0), #3 wrong (1!=3), #4 correct (1)
  assert.equal(calculateScore(userAnswers, mockQuestions), 3);
});

test('calculateScore handles empty or partial answers safely', () => {
  assert.equal(calculateScore([], mockQuestions), 0);
  assert.equal(calculateScore([null, 0, undefined], mockQuestions), 1);
});

test('calculatePercentage calculates whole percentages properly', () => {
  assert.equal(calculatePercentage(7, 10), 70);
  assert.equal(calculatePercentage(10, 10), 100);
  assert.equal(calculatePercentage(0, 10), 0);
  assert.equal(calculatePercentage(3, 9), 33);
  assert.equal(calculatePercentage(0, 0), 0);
});

test('getPerformanceTier classifies thresholds properly', () => {
  assert.equal(getPerformanceTier(95).badge, 'Exceptional');
  assert.equal(getPerformanceTier(90).badge, 'Exceptional');
  assert.equal(getPerformanceTier(80).badge, 'Proficient');
  assert.equal(getPerformanceTier(60).badge, 'Good Try');
  assert.equal(getPerformanceTier(40).badge, 'Learning');
});

test('formatQuestionCounter formats readable label', () => {
  assert.equal(formatQuestionCounter(0, 10), 'Question 1 of 10');
  assert.equal(formatQuestionCounter(9, 10), 'Question 10 of 10');
});

test('calculateProgressPercentage reflects completed question progress', () => {
  assert.equal(calculateProgressPercentage(0, 10), 10);
  assert.equal(calculateProgressPercentage(9, 10), 100);
});

test('countAnsweredQuestions counts valid answers correctly', () => {
  assert.equal(countAnsweredQuestions([0, 1, null, 2], 4), 3);
  assert.equal(countAnsweredQuestions([-1, -1, -1], 3), 0);
});
