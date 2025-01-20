'use client'
import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import getQuizByTitle from "@/firebase/firestore/getQuizByTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function QuizPage({ params }) {
  const { quizname } = params;
  const { user } = useAuthContext();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchQuiz = async () => {
      const { result, error } = await getQuizByTitle(user.uid, quizname.replace(/-/g, ' '));
      if (error || !result) {
        console.error('Error fetching quiz:', error);
        router.push("/dashboard");
        return;
      }
      setQuiz(result);
      setLoading(false);
    };

    fetchQuiz();
  }, [user, quizname, router]);

  const handleSubmit = () => {
    if (!quiz) return;

    const newCheckedAnswers = {};
    let correctCount = 0;

    quiz.questions.forEach((question, index) => {
      const isCorrect = selectedAnswers[index] === question.correct_answer;
      newCheckedAnswers[index] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setCheckedAnswers(newCheckedAnswers);
    setScore(correctCount);
    setSubmitted(true);
  };

  const allQuestionsAnswered = quiz?.questions.every((_, index) => selectedAnswers[index]);

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
            Your score: <span className="font-bold">{score}</span> out of {quiz.questions.length} questions correct
            ({Math.round((score / quiz.questions.length) * 100)}%)
          </p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div className="grid gap-6">
          {quiz.questions.map((question, index) => (
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
                <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                <p>{question.question}</p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[index]}
                  onValueChange={(value) => setSelectedAnswers({
                    ...selectedAnswers,
                    [index]: value
                  })}
                  disabled={submitted}
                >
                  {question.answers.map((answer, ansIndex) => (
                    <div key={ansIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={answer} id={`q${index}-a${ansIndex}`} />
                      <Label 
                        htmlFor={`q${index}-a${ansIndex}`}
                        className={submitted && answer === question.correct_answer ? "text-green-600 font-semibold" : ""}
                      >
                        {answer}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              {submitted && (
                <CardFooter>
                  <p className={checkedAnswers[index] ? "text-green-600" : "text-red-600"}>
                    {checkedAnswers[index] ? "Correct!" : "Incorrect"}
                    {!checkedAnswers[index] && (
                      <span className="ml-2">
                        Correct answer: {question.correct_answer}
                      </span>
                    )}
                  </p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || submitted}
            className="w-full max-w-md"
          >
            {submitted ? 'Submitted' : 'Submit Answers'}
          </Button>
        </div>
      </div>
    </div>
  );
}