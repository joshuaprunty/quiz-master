"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/context/AuthContext";
import saveQuiz from "@/firebase/firestore/saveQuiz";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import SaveQuizModal from "./SaveQuizModal";
import QuizConfigModal from "./QuizConfigModal";
import { useQuestionState } from "@/hooks/useQuestionState";
import { analyzeText, generateQuestions } from "@/services/quizService";
import QuestionCard from "@/components/questions/QuestionCard";
import TopicCard from "@/components/TopicCard";
import { COPY_TEXT } from "@/lib/utils";
import TopicEditor from "@/components/TopicEditor";

export default function TextInput() {
  const [studyText, setStudyText] = useState("");
  const [topics, setTopics] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [uiState, setUiState] = useState('initial');
  const { user } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();
  const {
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
  } = useQuestionState();

  const [isAddingTopic, setIsAddingTopic] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setStudyText(reader.result);
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5242880
  });

  const handleTopicToggle = (index, enabled) => {
    setTopics(prevTopics => 
      prevTopics.map((topic, i) => 
        i === index ? { ...topic, priority: enabled ? 1 : 0 } : topic
      )
    );
  };

  const handlePriorityChange = (index, value) => {
    setTopics(prevTopics => 
      prevTopics.map((topic, i) => 
        i === index ? { ...topic, priority: value } : topic
      )
    );
  };

  const copyTest = () => {
    navigator.clipboard.writeText(COPY_TEXT)
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
      setTopics(parsedData.topics.map(topic => ({
        ...topic,
        priority: 1
      })));
      setUiState('topics');
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

  const handleGenerateQuestions = async (config) => {
    const enabledTopics = topics.filter(topic => topic.priority > 0);
    
    if (enabledTopics.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enable at least one topic for the quiz.",
      });
      return;
    }

    setIsConfigModalOpen(false);
    setUiState('loading');
    
    try {
      const data = await generateQuestions(studyText, config, enabledTopics);
      setQuestions(data);
      setSelectedAnswers({});
      setCheckedAnswers({});
      setUiState('questions');
    } catch (error) {
      console.error("Error generating questions:", error);
      setUiState('topics');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate questions. Please try again.",
      });
    }
  };

  const handleSaveQuiz = async (title, isPublic) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save a quiz.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveQuiz(user.uid, { 
        title, 
        questions, 
        public: isPublic 
      });
      toast({
        title: "Success",
        description: "Quiz saved successfully!",
      });
      router.push('/dashboard');
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

  const checkAnswer = (questionIndex) => {
    const question = questions[questionIndex];
    let isCorrect;
    
    if (question.type === 'short-answer') {
      const userAnswer = (selectedAnswers[questionIndex] || '').toLowerCase().trim();
      const correctAnswer = question.correct_answer.toLowerCase().trim();
      isCorrect = userAnswer === correctAnswer;
    } else {
      isCorrect = selectedAnswers[questionIndex] === question.correct_answer;
    }
    
    setCheckedAnswers({
      ...checkedAnswers,
      [questionIndex]: isCorrect,
    });
    
    setHasAttempted({
      ...hasAttempted,
      [questionIndex]: true
    });
  };

  const handleAcceptRegeneration = (index) => {
    // Clear the pending regeneration state
    setPendingRegeneration(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleRevertRegeneration = (index) => {
    // Revert to the previous question
    setQuestions(prevQuestions =>
      prevQuestions.map((q, i) =>
        i === index ? pendingRegeneration[index].previous : q
      )
    );

    // Clear the pending regeneration state
    setPendingRegeneration(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleRegenerateQuestion = async (index) => {
    setLoadingStates(prev => ({ ...prev, [index]: true }));
    
    try {
      const question = questions[index];
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: studyText,
          questionType: question.type
        }),
      });

      if (!response.ok) throw new Error("Question regeneration failed");

      const newQuestion = await response.json();
      if (newQuestion.error) {
        throw new Error(newQuestion.error);
      }

      // Store the current question before replacing it
      setPendingRegeneration(prev => ({
        ...prev,
        [index]: {
          previous: questions[index],
          new: newQuestion
        }
      }));

      setQuestions(prevQuestions => 
        prevQuestions.map((q, i) => 
          i === index ? newQuestion : q
        )
      );

      // Reset states for this question
      setSelectedAnswers(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setCheckedAnswers(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setExplanationVisible(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

    } catch (error) {
      console.error("Error regenerating question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to regenerate question",
      });
    } finally {
      setLoadingStates(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
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

      setCheckedAnswers({});
    }
  };

  return (
    <div className="space-y-4 my-12 max-w-4xl">
      <Button 
        onClick={copyTest}
        variant="outline"
        className="fixed bottom-8 right-8 z-50 shadow-md hover:shadow-lg transition-shadow px-6"
      >
        Copy Sample Input
      </Button>
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
          <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer">
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

      <div className="flex gap-4">
        <Button 
          onClick={handleAnalyzeText} 
          className="w-full" 
          disabled={isAnalyzing || !studyText.trim() || uiState === 'loading'}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Topics"}
        </Button>
      </div>

      {uiState === 'topics' && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Main Topics Identified:</h2>
            <Button 
              variant="outline"
              onClick={() => setIsConfigModalOpen(true)}
              disabled={!topics.some(topic => topic.priority > 0)}
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
                  setTopics(prev => [...prev, newTopic]);
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

      {uiState === 'loading' && (
        <div className="flex flex-col items-center justify-center space-y-4 mt-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium">Generating your quiz...</p>
        </div>
      )}

      {uiState === 'questions' && questions && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Practice Questions:</h2>
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
                onEditClick={setEditingIndex}
                onEditChange={(index, field, value) => {
                  const updatedQuestions = [...questions];
                  updatedQuestions[index][field] = value;
                  setQuestions(updatedQuestions);
                }}
                onCorrectAnswerSelection={setEditingCorrectAnswer}
                onSaveEdit={() => {
                  setEditingIndex(null);
                  setEditingCorrectAnswer(null);
                }}
                onRegenerateQuestion={handleRegenerateQuestion}
                onAcceptRegeneration={handleAcceptRegeneration}
                onRevertRegeneration={handleRevertRegeneration}
                onDeleteQuestion={handleDeleteQuestion}
                onAnswerSelect={(value) => 
                  setSelectedAnswers(prev => ({ ...prev, [index]: value }))
                }
                onCheckAnswer={checkAnswer}
                onToggleExplanation={() => 
                  setExplanationVisible(prev => ({ ...prev, [index]: !prev[index] }))
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

      <QuizConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleGenerateQuestions}
        enabledTopicCount={topics?.filter(topic => topic.priority > 0).length || 0}
      />

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
