"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

// Modals
import QuizConfigModal from "./QuizConfigModal";
import SaveQuizModal from "./SaveQuizModal";

// Services & Hooks
import saveQuiz from "@/firebase/firestore/saveQuiz";
import { analyzeText, generateQuestions } from "@/services/quizService";

// Child Components
import TopicCard from "@/components/TopicCard";
import TopicEditor from "@/components/TopicEditor";
import QuestionCard from "@/components/questions/QuestionCard";
import { COPY_TEXT } from "@/lib/utils";

// State Hook for questions
import { useQuestionState } from "@/hooks/useQuestionState";

export default function TextInput() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  // ================== 1. Basic local states ==================
  const [studyText, setStudyText] = useState("");
  const [topics, setTopics] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uiState, setUiState] = useState("initial");

  // Modal states
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Toggle adding a custom topic
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // ================== 2. Reusing questionState from Hook ==================
  const {
    questions,
    setQuestions,

    // For storing user selected answers
    selectedAnswers,
    setSelectedAnswers,

    // For storing correct/incorrect checks
    checkedAnswers,
    setCheckedAnswers,

    // For controlling which question is in edit mode
    editingIndex,
    setEditingIndex,

    // The correct answer in edit mode
    editingCorrectAnswer,
    setEditingCorrectAnswer,

    // Explanation toggles
    explanationVisible,
    setExplanationVisible,

    // Others
    hasAttempted,
    setHasAttempted,
    loadingStates,
    setLoadingStates,
    pendingRegeneration,
    setPendingRegeneration,
  } = useQuestionState();

  // ================== 3. Drag-and-drop for uploading files ==================
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setStudyText(reader.result);
    reader.readAsText(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    maxSize: 5242880, // 5MB
  });

  // ================== 4. Copy Sample Input ==================
  const copyTest = () => {
    navigator.clipboard
      .writeText(COPY_TEXT)
      .then(() => {
        toast({
          title: "Copied",
          description: `Sample notes copied to clipboard`,
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy text",
        });
      });
  };

  // ================== 5. Analyze Text -> get topics ==================
  const handleAnalyzeText = async () => {
    if (!studyText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text before analyzing.",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const rawData = await analyzeText(studyText);
      const parsedData = JSON.parse(rawData);

      // Default each topic's priority to 1
      setTopics(
        parsedData.topics.map((topic) => ({
          ...topic,
          priority: 1,
        }))
      );
      setUiState("topics");
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze text. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ================== 6. Handling topics ==================
  const handleTopicToggle = (index, enabled) => {
    setTopics((prev) =>
      prev.map((topic, i) =>
        i === index ? { ...topic, priority: enabled ? 1 : 0 } : topic
      )
    );
  };

  const handlePriorityChange = (index, value) => {
    setTopics((prev) =>
      prev.map((topic, i) => (i === index ? { ...topic, priority: value } : topic))
    );
  };

  // ================== 7. Generate Questions from config ==================
  const handleGenerateQuestions = async (config) => {
    const enabledTopics = topics.filter((t) => t.priority > 0);
    if (enabledTopics.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enable at least one topic for the quiz.",
      });
      return;
    }

    setIsConfigModalOpen(false);
    setUiState("loading");
    try {
      const data = await generateQuestions(studyText, config, enabledTopics);
      // Reset states
      setQuestions(data);
      setSelectedAnswers({});
      setCheckedAnswers({});
      setUiState("questions");
    } catch (error) {
      console.error("Error generating questions:", error);
      setUiState("topics");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate questions. Please try again.",
      });
    }
  };

  // ================== 8. Save Quiz to Firestore ==================
  const handleSaveQuiz = async (title, isPublic) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save a quiz.",
      });
      return;
    }
    if (!questions?.length) {
      toast({
        variant: "destructive",
        title: "No Questions",
        description: "You have no questions to save.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const slug = title
        .toLowerCase()
        .replace(/[\W_]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await saveQuiz(user.uid, {
        title,
        slug,
        questions,
        public: isPublic,
      });
      toast({
        title: "Success",
        description: "Quiz saved successfully!",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quiz. Please try again.",
      });
    } finally {
      setIsSaving(false);
      setIsSaveModalOpen(false);
    }
  };

  // ================== 9. Check Answer Handler ==================
  function handleCheckAnswer(questionIndex) {
    const question = questions[questionIndex];
    let isCorrect = false;
  
    if (question.type === "short-answer") {
      const userAnswer = (selectedAnswers[questionIndex] || "").trim().toLowerCase();
      const correctAnswer = question.correct_answer.trim().toLowerCase();
      isCorrect = userAnswer === correctAnswer;
    } else {
      isCorrect = selectedAnswers[questionIndex] === question.correct_answer;
    }
  
    setCheckedAnswers((prev) => ({
      ...prev,
      [questionIndex]: isCorrect,
    }));
  }

  // ================== 10. Regenerate Handler ==================
  async function handleRegenerateQuestion(questionIndex) {
    try {
      const oldQ = questions[questionIndex];
  
      const payload = {
        text: studyText || "A relevant snippet for context", 
        questionType: oldQ.type,
      };
  
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error("Regenerate failed:", await response.json());
        return;
      }
      const newQuestion = await response.json();
  
      // Locally replace old question with the new question
      setQuestions((prev) => {
        const updated = [...prev];
        updated.splice(questionIndex, 1, newQuestion);
        return updated;
      });
  
      // Reset check states, explanation states, etc
      setCheckedAnswers((prev) => ({ ...prev }));
      setExplanationVisible((prev) => ({ ...prev }));
    } catch (error) {
      console.error("Error regenerating question:", error);
    }
  }
  
  // ================== 11. Edit Handler ==================
  function handleEditClick(index) {
    setEditingIndex(index);
    setEditingCorrectAnswer(questions[index].correct_answer);
  }

  // If user modifies the question text or answers, handle that in onEditChange
  // If user modifies the correct answer selection, call a function to set editingCorrectAnswer

  function handleSaveEdit() {
    const updatedQuestions = questions.map((q, i) =>
      i === editingIndex ? { ...q, correct_answer: editingCorrectAnswer } : q
    );
    setQuestions(updatedQuestions);

    setEditingIndex(null);
    setEditingCorrectAnswer(null);
    setCheckedAnswers({});
  }

  // ================== 12. Delete Question ==================
  function handleDeleteQuestion(questionIndex) {
    if (!confirm(`Delete question #${questionIndex + 1}?`)) return;
    const updated = questions.filter((_, i) => i !== questionIndex);
    setQuestions(updated);
    setEditingIndex(null);
    setEditingCorrectAnswer(null);
    setCheckedAnswers({});
  }

  // ================== 13. Render ==================
  return (
    <div className="space-y-4 my-12 max-w-4xl">
      {/* Copy Sample Input */}
      <Button
        onClick={copyTest}
        variant="outline"
        className="fixed bottom-8 right-8 z-50 shadow-md hover:shadow-lg transition-shadow px-6"
      >
        Copy Sample Input
      </Button>

      {/* Tabs for text input vs file upload */}
      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Text Input</TabsTrigger>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <Textarea
            placeholder="Paste your study material here..."
            value={studyText}
            onChange={(e) => setStudyText(e.target.value)}
            className="min-h-[200px]"
          />
        </TabsContent>

        <TabsContent value="upload">
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <div>
                <p>Drag and drop your file here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, TXT, DOC, DOCX (Max 5MB)
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Analyze Topics Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleAnalyzeText}
          className="w-full"
          disabled={isAnalyzing || !studyText.trim() || uiState === "loading"}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Topics"}
        </Button>
      </div>

      {/* Topics UI */}
      {uiState === "topics" && topics && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Main Topics Identified:</h2>
            <Button
              variant="outline"
              onClick={() => setIsConfigModalOpen(true)}
              disabled={!topics.some((topic) => topic.priority > 0)}
            >
              Next: Configure Questions
            </Button>
          </div>
          <div className="grid gap-4">
            {topics.map((topic, index) => (
              <TopicCard
                key={index}
                topic={topic}
                index={index}
                onTopicToggle={handleTopicToggle}
                onPriorityChange={handlePriorityChange}
              />
            ))}
            {isAddingTopic && (
              <TopicEditor
                onSave={(newTopic) => {
                  setTopics((prev) => [...prev, newTopic]);
                  setIsAddingTopic(false);
                }}
                onCancel={() => setIsAddingTopic(false)}
              />
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setIsAddingTopic(true)}
            className="w-full"
            disabled={isAddingTopic}
          >
            + Add Custom Topic
          </Button>
        </div>
      )}

      {/* Loading UI after config */}
      {uiState === "loading" && (
        <div className="flex flex-col items-center justify-center space-y-4 mt-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium">Generating your quiz...</p>
        </div>
      )}

      {/* Questions UI */}
      {uiState === "questions" && questions && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Practice Questions:</h2>

          {/* Render each question with your new callbacks */}
          <div className="grid gap-6">
            {questions.map((question, index) => (
              <QuestionCard
                key={index}
                question={question}
                index={index}
                editingIndex={editingIndex}
                editingCorrectAnswer={editingCorrectAnswer}
                selectedAnswers={selectedAnswers}
                checkedAnswers={checkedAnswers}
                explanationVisible={explanationVisible}
                pendingRegeneration={pendingRegeneration}
                loadingStates={loadingStates}
                hasAttempted={hasAttempted}

                // ==========  A. Edit  ==========
                onEditClick={() => handleEditClick(index)}
                onEditChange={(i, field, value) => {
                  // user typed new question text or new answer text
                  const updated = [...questions];
                  updated[i][field] = value;
                  setQuestions(updated);
                }}
                onCorrectAnswerSelection={(answer) => setEditingCorrectAnswer(answer)}
                onSaveEdit={handleSaveEdit}  // merges editingCorrectAnswer into correct_answer

                // ==========  B. Regenerate  ==========
                onRegenerateQuestion={() => handleRegenerateQuestion(index)}

                // ==========  C. Delete  ==========
                onDeleteQuestion={() => handleDeleteQuestion(index)}

                // ==========  D. Check Answer  ==========
                onCheckAnswer={() => handleCheckAnswer(index)}

                // ==========  E. Answer Selection  ==========
                onAnswerSelect={(value) =>
                  setSelectedAnswers((prev) => ({ ...prev, [index]: value }))
                }

                // ==========  F. Explanation Toggle  ==========
                onToggleExplanation={() =>
                  setExplanationVisible((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }))
                }
              />
            ))}
          </div>

          <Button
            onClick={() => setIsSaveModalOpen(true)}
            className="mt-4"
            disabled={!questions?.length}
          >
            Save Quiz
          </Button>
        </div>
      )}

      {/* Config Modal */}
      <QuizConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleGenerateQuestions}
        enabledTopicCount={topics?.filter((t) => t.priority > 0).length || 0}
      />

      {/* Save Quiz Modal */}
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