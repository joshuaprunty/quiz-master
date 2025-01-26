"use client";
import { use, useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import getQuizByTitle from "@/firebase/firestore/getQuizByTitle";
import updateQuiz from "@/firebase/firestore/updateQuiz";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function QuizPage({ params }) {
  const { quizname } = use(params);
  const { user } = useAuthContext();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});

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
      const { result, error } = await getQuizByTitle(
        user.uid,
        quizname.replace(/-/g, " ")
      );
      if (error || !result) {
        router.push("/dashboard");
        return;
      }
      setQuiz(result);
      setQuestions(result.questions);
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

  const checkAnswer = (questionIndex) => {
    const question = questions[questionIndex];

    const isCorrect =
      selectedAnswers[questionIndex] === question.correct_answer;
    setCheckedAnswers({
      ...checkedAnswers,
      [questionIndex]: isCorrect,
    });
  };

  const handleCorrectAnswerSelection = (index, answer) => {
    setEditingCorrectAnswer(answer);
  };

  const handleSaveEdit = async () => {
    if (!questions[editingIndex].answers.includes(editingCorrectAnswer)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a correct answer before saving.",
      });
      return;
    }

    const question = questions[editingIndex];
    if (question.answers.some((answer) => !answer.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All answer choices must be filled out before saving.",
      });
      return;
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

  const handleSubmit = () => {
    if (!quiz) return;

    const newCheckedAnswers = {};
    let correctCount = 0;

    questions.forEach((question, index) => {
      const isCorrect = selectedAnswers[index] === question.correct_answer;
      newCheckedAnswers[index] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setCheckedAnswers(newCheckedAnswers);
    setScore(correctCount);
    setSubmitted(true);
  };

  const allQuestionsAnswered = questions.every(
    (_, index) => selectedAnswers[index]
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
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
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
              key={index}
              className={`w-full ${
                submitted && checkedAnswers[index] !== undefined
                  ? checkedAnswers[index]
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
                <RadioGroup
                  value={selectedAnswers[index]}
                  onValueChange={(value) =>
                    setSelectedAnswers({
                      ...selectedAnswers,
                      [index]: value,
                    })
                  }
                  disabled={submitted}
                >
                  {question.answers.map((answer, ansIndex) => (
                    <div key={ansIndex} className="flex items-center space-x-2">
                      {editingIndex === index ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <RadioGroupItem
                            value={answer}
                            id={`q${index}-a${ansIndex}`}
                          />
                          <Label htmlFor={`q${index}-a${ansIndex}`}>
                            {answer}
                          </Label>
                        </>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-end items-center">
                {editingIndex === index ? (
                  <Button onClick={handleSaveEdit} variant="save">
                    Save
                  </Button>
                ) : (
                  <div className="flex flex-row flex-1 justify-between">
                    <div className="flex flex-row items-center gap-4">
                      <Button
                        onClick={() => checkAnswer(index)}
                        disabled={!selectedAnswers[index]}
                        variant="secondary"
                      >
                        Check Answer
                      </Button>
                      {checkedAnswers[index] !== undefined && (
                        <p
                          className={
                            checkedAnswers[index]
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {checkedAnswers[index] ? "Correct!" : "Incorrect"}
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
