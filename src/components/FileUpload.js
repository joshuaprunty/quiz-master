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
import { RiSparkling2Fill } from "react-icons/ri";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from 'react-icons/bs';

const COPY_TEXT =
`
Lecture 3: Application-Layer Protocols, HTTP - Key Points
Application-Layer Protocols
Purpose:
Enable applications on different devices to communicate.
Examples: HTTP, SMTP, DNS.
Two Architectures:
Client-Server:
Servers handle requests and are always powered on.
Clients initiate requests but do not communicate directly with other clients.
Peer-to-Peer (P2P):
Peers share equal responsibilities (e.g., BitTorrent, Skype).
Scalable but challenging due to churn, IP changes, and upload limitations.

HTTP (HyperText Transfer Protocol)
Overview:
Client-server protocol built on top of TCP.
Stateless: Each request is independent and self-contained.
Key Features:
Request:
Includes a method (e.g., GET, POST), headers, and an optional body.
Response:
Includes a status code (e.g., 200 OK, 404 Not Found), headers, and an optional body.
HTTP Transaction:
Client opens a TCP socket to the server.
Sends an HTTP request.
Server processes the request and sends a response.
Client reads and processes the response.

HTTP Methods and Status Codes
Methods:
GET: Retrieve data.
POST: Send data to the server.
PUT: Create/replace a resource.
DELETE: Remove a resource.
HEAD: Retrieve headers only.
Status Codes:
2xx: Success (e.g., 200 OK).
3xx: Redirection (e.g., 301 Moved Permanently).
4xx: Client errors (e.g., 404 Not Found).
5xx: Server errors (e.g., 500 Internal Server Error).

Cookies
Purpose:
Maintain user state across stateless HTTP requests.
Process:
Server sends a Set-Cookie header in the HTTP response.
Client stores the cookie locally and includes it in subsequent requests.
Server identifies the user using the cookie.
Uses:
Authentication, session tracking, personalization.
Security Concerns:
Vulnerable to impersonation attacks (e.g., CSRF).
Best practices include setting SameSite attributes to prevent misuse.

HTTP Evolution and REST APIs
Evolution:
HTTP/1.0 (1991): Basic document fetching.
HTTP/1.1 (1997): Keep-alive connections.
HTTP/2 (2014): Binary framing and pipelining.
HTTP/3 (2022): Built on QUIC for better performance.
REST APIs:
Use HTTP for client-server communication.
Enable interaction with services via structured requests (e.g., GET, POST).
Often return JSON data for programmatic use.

SMTP (Simple Mail Transfer Protocol)
Purpose:
Enables email transfer between servers using TCP (port 25).
Process:
Stateful communication where the server remembers past interactions.
Commands like MAIL FROM, RCPT TO, and DATA establish and send messages.
Differences from HTTP:
SMTP is stateful, while HTTP is stateless.


Lecture 4: Domain Name Service (DNS) - Key Points
DNS: The Internet's Directory Service
Goals of DNS:
Translate human-readable domain names to machine-readable IP addresses (e.g., northwestern.edu → 129.105.136.48).
Provide portability by allowing domain names to remain constant even as server IP addresses change.
Distributed and Hierarchical Design:
Decentralized structure for scalability and fault tolerance.
Hierarchical levels:
Root Servers: Manage top-level domains (TLDs) like .com, .edu.
TLD Servers: Direct queries to authoritative servers.
Authoritative Servers: Store mappings for specific domains (e.g., example.com).

How DNS Works
Iterative Querying:
Queries traverse the hierarchy:
Client contacts the root server.
Root server directs the client to the TLD server.
TLD server points to the authoritative server.
Authoritative server provides the requested IP address.
Caching:
Local DNS resolvers cache responses to reduce query times and network traffic.
Cached records have a TTL (Time to Live) after which they expire.

DNS Records
Types of Resource Records (RRs):
A: Maps domain names to IPv4 addresses.
AAAA: Maps domain names to IPv6 addresses.
CNAME: Canonical name alias for another domain.
MX: Mail exchange records for email routing.
PTR: Reverse lookup, mapping IP to domain name.
TXT: Key-value pairs for arbitrary data (e.g., SPF, DKIM).
SRV: Defines servers for specific services.
`

export default function TextInput() {
  const [studyText, setStudyText] = useState("");
  const [topics, setTopics] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState(null);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState({});
  const [questionType, setQuestionType] = useState("multiple-choice");

  const { user } = useAuthContext();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [questionConfig, setQuestionConfig] = useState({
    'multiple-choice': 4,
    'true-false': 2,
    'short-answer': 2
  });

  // Separate loading states for different operations
  const [loadingStates, setLoadingStates] = useState({}); // For individual question regeneration
  const [isGenerating, setIsGenerating] = useState(false); // For main question generation
  const [isAnalyzing, setIsAnalyzing] = useState(false); // For topic analysis

  // Add state for storing previous questions during regeneration
  const [pendingRegeneration, setPendingRegeneration] = useState({});

  const [isProcessing, setIsProcessing] = useState(false);

  const [hasAttempted, setHasAttempted] = useState({});

  const handleEditClick = (index) => {
    setEditingIndex(index);
    const question = questions[index];
    setEditingCorrectAnswer(question.correct_answer);
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

              if (q.answers[answerIndex] === editingCorrectAnswer) {
                setEditingCorrectAnswer(value);
              }

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
      // For multiple choice and true-false questions
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
    setCheckedAnswers({});
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

    setIsAnalyzing(true);
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

      if (rawData.error) {
        throw new Error(rawData.error);
      }

      try {
        const parsedData = JSON.parse(rawData);
        setTopics(parsedData.topics);
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
      setIsAnalyzing(false);
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
  
    setIsGenerating(true);
    try {
      const response = await fetch("/api/questiongen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: studyText,
          config: questionConfig 
        }),
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
      setIsGenerating(false);
    }
  };

  const checkAnswer = (index) => {
    setHasAttempted(prev => ({ ...prev, [index]: true }));
    const isCorrect = selectedAnswers[index] === questions[index].correct_answer;
    if (isCorrect) {
      setCheckedAnswers(prev => ({ ...prev, [index]: true }));
    }
  };

  const handleSaveQuiz = async (title) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    // Validate that all questions have non-empty answers
    for (const question of questions) {
      if (question.type !== 'short-answer' && question.answers.some((answer) => !answer.trim())) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "All answer choices in the quiz must be filled out.",
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const quizData = {
        title,
        questions,
        originalText: studyText,
      };

      const { error } = await saveQuiz(user.uid, quizData);

      // quiz already exists with title
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return;
      }

      setIsSaveModalOpen(false);
      setSaveDisabled(true);

      toast({
        variant: "success",
        title: "Quiz Saved",
        description:
          "Your quiz has been successfully saved. Navigating to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
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

      setCheckedAnswers({});
    }
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

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.type.match('application/pdf|text/plain|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, TXT, or Word document.",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // For text files, we can read directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        setStudyText(text);
        toast({
          title: "Success",
          description: "File content loaded successfully.",
        });
      } else {
        // For PDFs and Word docs, we'll need to send to backend
        const formData = new FormData();
        formData.append('file', file);

        console.log('Attempting to upload file:', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        });

        const response = await fetch("/api/extract-text", {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          console.error('Server response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });
          
          const errorData = await response.text();
          console.error('Error response body:', errorData);
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStudyText(data.text);
        toast({
          title: "Success",
          description: "File processed successfully.",
        });
      }
    } catch (error) {
      console.error('Error processing file:', {
        error: error.message,
        stack: error.stack
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process file. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, setStudyText]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div className="space-y-4 my-12 max-w-4xl">
      <Button 
        onClick={copyTest}
        variant="outline"
        className="w-[100px]"
      >
        Copy Sample Input
      </Button>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text Input</TabsTrigger>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="mt-6">
          <Textarea
            placeholder="Paste your study materials here..."
            className="min-h-[300px]"
            value={studyText}
            onChange={(e) => setStudyText(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-6">
          <div
            {...getRootProps()}
            className={`
              min-h-[300px] 
              border-2 
              border-dashed 
              border-gray-300 
              rounded-lg 
              flex 
              items-center 
              justify-center 
              bg-muted/50
              transition-colors
              cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : ''}
              ${isProcessing ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-center p-6">
              {isProcessing ? (
                <p className="text-muted-foreground">Processing file...</p>
              ) : isDragActive ? (
                <p className="text-primary">Drop your file here</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Drag and drop your file here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, TXT, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsConfigModalOpen(true)}
          className="w-1/3"
        >
          Configure Questions
        </Button>
        <Button 
          onClick={generateQuestions}
          disabled={isGenerating}
          className="w-1/3"
        >
          {isGenerating ? "Generating..." : "Generate Questions"}
        </Button>
        <Button 
          onClick={analyzeText} 
          className="w-1/3" 
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Topics"}
        </Button>
      </div>
      <QuizConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={setQuestionConfig}
      />

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
                  <div className="flex flex-row justify-between items-start">
                    <h3 className="font-semibold text-lg">
                      {index + 1}. {question.question}
                    </h3>
                    {pendingRegeneration[index] ? (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleAcceptRegeneration(index)}
                          variant="save"
                          className="w-[100px]"
                        >
                          Keep New
                        </Button>
                        <Button
                          onClick={() => handleRevertRegeneration(index)}
                          variant="outline"
                          className="w-[100px]"
                        >
                          Revert
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                          >
                            <BsThreeDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRegenerateQuestion(index)}
                            disabled={loadingStates[index]}
                            className="flex items-center"
                          >
                            <RiSparkling2Fill className="w-4 h-4 mr-2" />
                            <span>{loadingStates[index] ? "Regenerating..." : "Regenerate"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditClick(index)}
                            className="flex items-center"
                          >
                            <FaRegEdit className="w-4 h-4 mr-2" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteQuestion(index)}
                            className="flex items-center text-red-600"
                          >
                            <FaRegTrashAlt className="w-4 h-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
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
                      <RadioGroup>
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
                      </RadioGroup>
                    )
                  ) : (
                    question.type === 'short-answer' ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={selectedAnswers[index] || ''}
                          onChange={(e) => 
                            setSelectedAnswers({
                              ...selectedAnswers,
                              [index]: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Type your answer here..."
                        />
                      </div>
                    ) : (
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
                            <RadioGroupItem
                              value={answer}
                              id={`q${index}-a${ansIndex}`}
                            />
                            <Label htmlFor={`q${index}-a${ansIndex}`}>
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
                    <div className="flex flex-row items-center gap-4 justify-start w-full">
                      <Button
                        onClick={() => checkAnswer(index)}
                        disabled={!selectedAnswers[index]}
                        variant={checkedAnswers[index] ? "save" : "default"}
                        className={checkedAnswers[index] ? "w-[100px]" : ""}
                      >
                        {checkedAnswers[index] ? "Correct!" : "Check Answer"}
                      </Button>
                      
                      {selectedAnswers[index] && checkedAnswers[index] && (
                        <Button
                          onClick={() => setExplanationVisible((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))}
                        >
                          {explanationVisible[index] ? "Hide Explanation" : "View Explanation"}
                        </Button>
                      )}
                      
                      {selectedAnswers[index] && !checkedAnswers[index] && hasAttempted[index] && (
                        <p className="text-red-600">
                          Incorrect
                        </p>
                      )}
                    </div>
                  )}

                  {/* Explanation Box */}
                  {explanationVisible[index] && (
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                      <p>{question.explanation}</p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          <Button
            onClick={() => setIsSaveModalOpen(true)}
            className="mt-4"
            disabled={saveDisabled}
          >
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
