"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster } from "@/components/ui/toaster";
import { useAuthContext } from "@/context/AuthContext";
import getPublicQuizByTitle from "@/firebase/firestore/getPublicQuizByTitle";
import getQuizByTitle from "@/firebase/firestore/getQuizByTitle";
import saveQuizResult from "@/firebase/firestore/saveQuizResult";
import updateQuiz from "@/firebase/firestore/updateQuiz";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function QuizPage({ params }) {
  const { quizname } = use(params);
  const { user } = useAuthContext();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [explanationVisible, setExplanationVisible] = useState({});

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
  
    const fetchQuiz = async () => {
      // First, try to fetch the quiz from the user's collection
      let { result, error } = await getQuizByTitle(
        user.uid,
        decodeURIComponent(quizname).replace(/-/g, " ")
      );
  
      // If not found or an error occurs, try the public collection
      if (error || !result) {
        ({ result, error } = await getPublicQuizByTitle(
          decodeURIComponent(quizname).replace(/-/g, " ")
        ));
      }
  
      if (error || !result) {
        router.push("/dashboard");
        return;
      }
      // Map questions with an id if necessary
      const questionsWithId = result.questions.map((q, i) => ({
        ...q,
        id: q.id || i.toString(), // fallback id
      }));
      setQuiz(result);
      setQuestions(questionsWithId);
      setLoading(false);
    };
  
    fetchQuiz();
  }, [user, quizname, router]);

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingCorrectAnswer(questions[index].correct_answer);
  };

  const handleEditChange = (questionIndex, field, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, i) => {
        if (i === questionIndex) {
          if (field.startsWith("answers")) {
            const match = field.match(/answers\[(\d+)\]/);
            if (match) {
              const answerIndex = parseInt(match[1], 10);
              const updatedAnswers = [...question.answers];
              updatedAnswers[answerIndex] = value;

              if (question.answers[answerIndex] === editingCorrectAnswer) {
                setEditingCorrectAnswer(value);
              }

              return { ...question, answers: updatedAnswers };
            }
          }
          return { ...question, [field]: value };
        }
        return question;
      })
    );
  };

  const checkAnswer = (questionId, question) => {
    let isCorrect;
    
    if (question.type === 'short-answer') {
      const userAnswer = (selectedAnswers[questionId] || '').toLowerCase().trim();
      const correctAnswer = question.correct_answer.toLowerCase().trim();
      isCorrect = userAnswer === correctAnswer;
    } else {
      isCorrect = selectedAnswers[questionId] === question.correct_answer;
    }
    
    setCheckedAnswers({
      ...checkedAnswers,
      [questionId]: isCorrect,
    });
  };

  const handleCorrectAnswerSelection = (index, answer) => {
    setEditingCorrectAnswer(answer);
  };

  const handleSaveEdit = async () => {
    const question = questions[editingIndex];
    
    if (question.type === 'short-answer') {
      if (!editingCorrectAnswer?.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a correct answer before saving.",
        });
        return;
      }
    } else {
      if (!question.answers.includes(editingCorrectAnswer)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a correct answer before saving.",
        });
        return;
      }

      if (question.answers.some((answer) => !answer.trim())) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "All answer choices must be filled out before saving.",
        });
        return;
      }
    }

    const updatedQuestions = questions.map((q, i) =>
      i === editingIndex ? { ...q, correct_answer: editingCorrectAnswer } : q
    );

    setQuestions(updatedQuestions);
    setEditingIndex(null);
    setEditingCorrectAnswer(null);
    setCheckedAnswers({});

    await saveQuiz(updatedQuestions);
  };

  const handleDeleteQuestion = async (index) => {
    if (confirm(`Delete Question ${index + 1}?`)) {
      const updatedQuestions = questions.filter((_, i) => i !== index);

      setQuestions(updatedQuestions);
      setEditingIndex(null);
      setEditingCorrectAnswer(null);

      setCheckedAnswers({});

      await saveQuiz(updatedQuestions);
    }
  };

  const saveQuiz = async (updatedQuestions) => {
    if (!quiz || !user) return;

    try {
      const updatedQuiz = { ...quiz, questions: updatedQuestions };
      const { error } = await updateQuiz(user.uid, quiz.id, updatedQuiz);
      if (error) {
        throw new Error(error);
      }

      for (const question of questions) {
        if (question.answers.some((answer) => !answer.trim())) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "All answer choices in the quiz must be filled out.",
          });
          return;
        }
      }

      toast({
        variant: "success",
        title: "Success",
        description: "Quiz updated successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes to the quiz.",
      });
    }
  };

  const handleRegenerateQuestion = async (questionIndex) => {
    // Check if the quiz has been submitted
    if (!submitted) {
      toast({
        variant: "destructive",
        title: "Quiz Not Submitted",
        description: "Please submit your answers before generating a similar question.",
      });
      return;
    }
  
    // Otherwise, proceed with generation...
    try {
      const response = await fetch("/api/generate-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentQuestion: {
            ...questions[questionIndex],
            quizId: quiz.id,
            userId: user.uid,
          },
        }),
      });
      if (response.ok) {
        const newQuestion = await response.json();
        // Mark the new question as generated and initialize/reset UI state for it
        const cleanNewQuestion = {
          ...newQuestion,
          isGenerated: true,
          explanation: newQuestion.explanation || "No explanation available.",
          id: newQuestion.id || Date.now().toString(),
        };
  
        setQuestions((prev) => {
          const updated = [...prev];
          updated.splice(questionIndex + 1, 0, cleanNewQuestion);
          return updated;
        });
        // Clear state for the new question if needed:
        setSelectedAnswers((prev) => ({ ...prev, [cleanNewQuestion.id]: "" }));
        setCheckedAnswers((prev) => ({ ...prev }));
        setExplanationVisible((prev) => ({ ...prev, [cleanNewQuestion.id]: false }));
      } else {
        console.error("Error generating similar question", await response.json());
      }
    } catch (error) {
      console.error("Error generating similar question", error);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const newCheckedAnswers = {};
    let correctCount = 0;
    const questionResults = {};

    questions.forEach((question, index) => {
      const isCorrect = selectedAnswers[question.id] === question.correct_answer;
      newCheckedAnswers[question.id] = isCorrect;
      if (isCorrect) correctCount++;
      
      questionResults[`question_${question.id}`] = {
        question: question.question,
        userAnswer: selectedAnswers[question.id],
        correctAnswer: question.correct_answer,
        result: isCorrect ? 'correct' : 'incorrect'
      };
    });

    setCheckedAnswers(newCheckedAnswers);
    setScore(correctCount);
    setSubmitted(true);

    // Save quiz results to Firestore
    try {
      const quizResultData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        score: Math.round((correctCount / questions.length) * 100),
        questions: questionResults
      };

      const { error } = await saveQuizResult(user.uid, quizResultData);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save quiz results.",
        });
      }
    } catch (err) {
      console.error("Error saving quiz results:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quiz results.",
      });
    }
  };

  const allQuestionsAnswered = questions.every(
    (question) => selectedAnswers[question.id]
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!quiz) {
    return <div className="p-8">Quiz not found</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold title-break">{quiz.title}</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-slate-100 rounded-lg">
          <p className="text-lg">
            Your score: <span className="font-bold">{score}</span> out of{" "}
            {questions.length} questions correct (
            {Math.round((score / questions.length) * 100)}%)
          </p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div className="grid gap-6">
          {questions.map((question, index) => (
            <Card
              key={question.id} // Use question.id here
              className={`w-full ${
                submitted && checkedAnswers[question.id] !== undefined
                  ? checkedAnswers[question.id]
                    ? "border-green-500"
                    : "border-red-500"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex flex-row justify-between items-center">
                  <h3 className="font-semibold text-lg">
                    Question {index + 1}
                  </h3>
                  <Button
                    onClick={() => handleDeleteQuestion(index)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      handleEditChange(index, "question", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                ) : (
                  <p>{question.question}</p>
                )}
              </CardHeader>
              <CardContent>
                {editingIndex === index ? (
                  question.type === 'short-answer' ? (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <input
                        type="text"
                        value={editingCorrectAnswer || ''}
                        onChange={(e) => setEditingCorrectAnswer(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Enter correct answer..."
                      />
                    </div>
                  ) : (
                    <div>
                      {question.answers.map((answer, ansIndex) => (
                        <div key={ansIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) =>
                              handleEditChange(
                                index,
                                `answers[${ansIndex}]`,
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          />
                          <input
                            type="checkbox"
                            checked={editingCorrectAnswer === answer}
                            onChange={() =>
                              handleCorrectAnswerSelection(index, answer)
                            }
                            className="h-6 w-6 checked:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  question.type === 'short-answer' ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={selectedAnswers[question.id] || ''}
                        onChange={(e) => 
                          setSelectedAnswers({
                            ...selectedAnswers,
                            [question.id]: e.target.value
                          })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Type your answer here..."
                        disabled={submitted && !question.isGenerated}
                      />
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedAnswers[question.id]}
                      onValueChange={(value) =>
                        setSelectedAnswers({
                          ...selectedAnswers,
                          [question.id]: value,
                        })
                      }
                      disabled={submitted && !question.isGenerated}
                    >
                      {question.answers.map((answer, ansIndex) => (
                        <div key={ansIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={answer} id={`q${question.id}-a${ansIndex}`} />
                          <Label htmlFor={`q${question.id}-a${ansIndex}`}>
                            {answer}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {editingIndex === index ? (
                  <Button onClick={handleSaveEdit} variant="save">
                    Save
                  </Button>
                ) : (
                  <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-row items-center gap-4">
                      <Button
                        onClick={() => checkAnswer(question.id, question)}
                        disabled={!selectedAnswers[question.id] || (submitted && !question.isGenerated)}
                        variant="secondary"
                      >
                        Check Answer
                      </Button>
                      {checkedAnswers[question.id] !== undefined && (
                        <p
                          className={
                            checkedAnswers[question.id]
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {checkedAnswers[question.id] ? "Correct!" : "Incorrect"}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleEditClick(index)}
                      variant="edit"
                    >
                      Edit
                    </Button>
                  </div>
                )}
                {/* Explanation Button */}
                <Button
                onClick={() => {
                  // Check if quiz is submitted
                  if (!submitted) {
                    toast({
                      variant: "destructive",
                      title: "Quiz Not Submitted",
                      description: "Please submit your quiz before viewing explanations.",
                    });
                    return;
                  }
                  // Then, check if the question has been answered
                  if (!selectedAnswers[question.id]) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Please answer the question first to view the explanation.",
                    });
                    return;
                  }
                  // Toggle explanation visibility
                  setExplanationVisible((prev) => ({
                    ...prev,
                    [question.id]: !prev[question.id],
                  }));
                }}
                className="mt-2"
              >
                {explanationVisible[question.id] ? "Hide Explanation" : "View Explanation"}
              </Button>
                {/* Generate Similar Question Button */}
                <Button
                  onClick={() => handleRegenerateQuestion(index)}
                  variant="secondary"
                  className="mt-2"
                >
                  Generate Similar Question
                </Button>

                {/* Explanation Box */}
                {explanationVisible[question.id] && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p>{question.explanation || "No explanation available."}</p>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || submitted}
            className="w-full max-w-md"
          >
            {submitted ? "Submitted" : "Submit Answers"}
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
