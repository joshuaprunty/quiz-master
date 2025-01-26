"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import SaveQuizModal from "./SaveQuizModal";
import saveQuiz from "@/firebase/firestore/saveQuiz";
import { useAuthContext } from "@/context/AuthContext";

export default function TextInput() {
  const [studyText, setStudyText] = useState("");
  const [topics, setTopics] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState(null);

  const { user } = useAuthContext();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingCorrectAnswer(questions[index].correct_answer);
  };

  const handleEditChange = (index, field, value) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.map((q, i) => {
        if (i === index) {
          if (field.startsWith("answers")) {
            const match = field.match(/answers\[(\d+)\]/);
            if (match) {
              const answerIndex = parseInt(match[1], 10);
              const updatedAnswers = [...q.answers];
              updatedAnswers[answerIndex] = value;
              return { ...q, answers: updatedAnswers };
            }
          }
          return { ...q, [field]: value };
        }
        return q;
      });
    });
  };

  const handleCorrectAnswerSelection = (index, answer) => {
    setEditingCorrectAnswer(answer);
  };

  const handleSaveEdit = () => {
    if (!editingCorrectAnswer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a correct answer before saving.",
      });
      return;
    }

    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => {
        if (i === editingIndex) {
          return { ...q, correct_answer: editingCorrectAnswer };
        }
        return q;
      })
    );

    setEditingIndex(null);
    setEditingCorrectAnswer(null);
  };

  const analyzeText = async () => {
    if (!studyText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text before analyzing.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: studyText }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const rawData = await response.json();

      // Check if the response is an error message
      if (rawData.error) {
        throw new Error(rawData.error);
      }

      try {
        // Parse the response and access the 'topics' array
        const parsedData = JSON.parse(rawData);
        setTopics(parsedData.topics); // Access the 'topics' array from the parsed object
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        setTopics([
          {
            topic: "Response",
            description: rawData,
          },
        ]);
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!studyText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text before generating questions.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/questiongen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: studyText }),
      });

      if (!response.ok) throw new Error("Question generation failed");

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setQuestions(data);
      setSelectedAnswers({});
      setCheckedAnswers({});
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setLoading(false);
    }
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

  const handleSaveQuiz = async (title) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const quizData = {
        title,
        questions,
        originalText: studyText,
      };

      const { error } = await saveQuiz(user.uid, quizData);

      if (error) {
        console.error("Error saving quiz:", error);
        return;
      }

      setIsSaveModalOpen(false);
      // Optionally add a success notification here
    } catch (error) {
      console.error("Error saving quiz:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = (index) => {
    if (confirm(`Delete Question ${index + 1}?`)) {
      setQuestions((prevQuestions) =>
        prevQuestions.filter((_, i) => i !== index)
      );

      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingCorrectAnswer(null);
      }
    }
  };

  return (
    <div className="space-y-4 my-12 max-w-4xl">
      <Textarea
        placeholder="Paste your study materials here..."
        className="min-h-[300px]"
        value={studyText}
        onChange={(e) => setStudyText(e.target.value)}
      />

      <div className="flex gap-4">
        <Button onClick={analyzeText} className="flex-1" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Topics"}
        </Button>

        <Button
          onClick={generateQuestions}
          className="flex-1"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Questions"}
        </Button>
      </div>

      {topics && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Main Topics Identified:</h2>
          <div className="grid gap-4">
            {topics.map((topic, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold">{topic.topic}</h3>
                <p className="text-gray-600 mt-2">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {questions && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Practice Questions:</h2>
          <div className="grid gap-6">
            {questions.map((question, index) => (
              <Card key={index} className="w-full">
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
                  >
                    {question.answers.map((answer, ansIndex) => (
                      <div
                        key={ansIndex}
                        className="flex items-center space-x-2"
                      >
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
          <Button onClick={() => setIsSaveModalOpen(true)} className="mt-4">
            Save Quiz
          </Button>
        </div>
      )}

      <SaveQuizModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveQuiz}
        loading={isSaving}
      />
      <Toaster />
    </div>
  );
}
