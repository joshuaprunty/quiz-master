import { useState } from 'react';

export function useQuestionState() {
  const [questions, setQuestions] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState(null);
  const [explanationVisible, setExplanationVisible] = useState({});
  const [hasAttempted, setHasAttempted] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [pendingRegeneration, setPendingRegeneration] = useState({});

  return {
    questions,
    setQuestions,
    selectedAnswers,
    setSelectedAnswers,
    checkedAnswers,
    setCheckedAnswers,
    editingIndex,
    setEditingIndex,
    editingCorrectAnswer,
    setEditingCorrectAnswer,
    explanationVisible,
    setExplanationVisible,
    hasAttempted,
    setHasAttempted,
    loadingStates,
    setLoadingStates,
    pendingRegeneration,
    setPendingRegeneration,
  };
}