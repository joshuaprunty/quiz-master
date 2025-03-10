"use client";
import DeleteQuizModal from "@/components/DeleteQuizModal";
import { useAuthContext } from "@/context/AuthContext";
import deleteQuiz from "@/firebase/firestore/deleteQuiz";
import getAllPublicQuizzes from "@/firebase/firestore/getAllPublicQuizzes";
import getUserQuizzes from "@/firebase/firestore/getUserQuizzes";
import { syncPublicQuiz } from "@/firebase/firestore/syncPublicQuiz";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdChecklist } from "react-icons/md";
import { TbSettings } from "react-icons/tb";

import QuizOptionsModal from "@/components/QuizOptionsModal";
import RenameQuizModal from "@/components/RenameQuizModal";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import updateQuiz from "@/firebase/firestore/updateQuiz";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  // Quiz lists
  const [quizzes, setQuizzes] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete quiz modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rename quiz modal
  const [quizToRename, setQuizToRename] = useState(null);

  // Options modal
  const [quizForOptions, setQuizForOptions] = useState(null);

  // Fetch quizzes
  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchQuizzes = async () => {
      // 1) Fetch user's quizzes
      const { result: userQuizzes, error: userError } = await getUserQuizzes(user.uid);
      if (userError) {
        console.error("Error fetching user quizzes:", userError);
        return;
      }
      setQuizzes(userQuizzes);

      // 2) Fetch public quizzes
      const { result: publicQuizzesData, error: publicError } = await getAllPublicQuizzes();
      if (publicError) {
        console.error("Error fetching public quizzes:", publicError);
        return;
      }

      setPublicQuizzes(publicQuizzesData);

      setLoading(false);
    };

    fetchQuizzes();
  }, [user, router]);

  // ------------------
  // CRUD Handlers
  // ------------------

  // Delete
  const handleDeleteClick = (quiz) => {
    setSelectedQuiz(quiz);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuiz) return;
    setIsDeleting(true);
    try {
      const { error } = await deleteQuiz(user.uid, selectedQuiz.id);
      if (error) {
        console.error("Error deleting quiz:", error);
        return;
      }

      // Refresh quizzes
      const { result } = await getUserQuizzes(user.uid);
      setQuizzes(result);

      // If the quiz is public, remove it from the public collection
      if (selectedQuiz.public) {
        const { error: syncError } = await syncPublicQuiz(selectedQuiz.id, selectedQuiz, false);
        if (syncError) throw new Error(syncError);
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false); // close the modal
      setSelectedQuiz(null);
      setTimeout(() => window.location.reload(), 1000); // refresh after a 2-second delay
    }
  };

  // Rename
  const handleRename = async (newTitle) => {
    if (!quizToRename) return;
    try {
      const updatedQuiz = { ...quizToRename, title: newTitle };
      const { error } = await updateQuiz(user.uid, quizToRename.id, updatedQuiz);
      if (error) throw new Error(error);

      // If the quiz is public, update its title in the public collection
      if (quizToRename.public) {
        const { error: syncError } = await syncPublicQuiz(quizToRename.id, updatedQuiz, true);
        if (syncError) throw new Error(syncError);
      }

      // Update local state
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizToRename.id ? { ...q, title: newTitle } : q))
      );

      toast({
        title: "Success",
        description: "Quiz renamed successfully.",
      });
    } catch (error) {
      console.error("Error renaming quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename quiz.",
      });
    } finally {
      setQuizToRename(null);
    }
  };

  // Options
  const handleOptionsUpdate = async (options) => {
    if (!quizForOptions) return;
    try {
      const updatedQuiz = { ...quizForOptions, ...options };
      const { error } = await updateQuiz(user.uid, quizForOptions.id, updatedQuiz);
      if (error) throw new Error(error);
  
      // Synchronize the public collection using syncPublicQuiz
      const { error: syncError } = await syncPublicQuiz(quizForOptions.id, updatedQuiz, options.public);
      if (syncError) throw new Error(syncError);
  
      // Update local state
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizForOptions.id ? { ...q, ...options } : q))
      );
  
      toast({
        title: "Success",
        description: "Quiz options updated successfully.",
      });
    } catch (error) {
      console.error("Error updating quiz options:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quiz options.",
      });
    } finally {
      setQuizForOptions(null);
    }
  };

  // Format for URL
  const formatTitle = (title) => {
    if (!title) return "";
    return title.replace(/ /g, "-");
  };

  // Loading
  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  // ------------------
  // Render
  // ------------------
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold my-2">Dashboard</h1>
      <Separator className="my-6 max-w-7xl" />

      <h2 className="text-xl font-semibold my-4">Your Quizzes</h2>
      {quizzes.length === 0 ? (
        <p className="text-center text-gray-500">
          No quizzes created yet. Create your first quiz!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-7xl">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="w-full">
              <div className="flex flex-row">
                <div className="relative flex items-center px-6 justify-center">
                  <MdChecklist className="h-12 w-12" />
                </div>
                <div className="flex flex-col justify-center w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {quiz.questions?.length || 0} questions
                    </p>
                  </CardHeader>
                  <CardFooter className="flex gap-2 pt-2">
                    <Link href={`/dashboard/${encodeURIComponent(formatTitle(quiz.title))}`} className="flex-1">
                      <Button className="w-full">View</Button>
                    </Link>

                    {/* Each quiz has its own dropdown menu */}
                    <DropdownMenu
                      // Optional: track open/close state or debug
                      onOpenChange={(open) => {
                        if (!open) {
                          // The menu just closed
                          // If you need to do something on close, do it here
                        }
                      }}
                      // Optional: manually override default close focus if desired
                      onCloseAutoFocus={(event) => {
                        // Typically you do nothing here, letting Radix revert focus to the trigger
                        // But if you want to prevent focusing the trigger:
                        // event.preventDefault(); // and then focus something else if you want
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <TbSettings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {/* "Rename" */}
                        <DropdownMenuItem
                          onSelect={() => {
                            // onSelect automatically closes the dropdown
                            // Then we open the Rename modal
                            setQuizToRename(quiz);
                          }}
                        >
                          <span>Rename</span>
                        </DropdownMenuItem>

                        {/* "Options" */}
                        <DropdownMenuItem
                          onSelect={() => {
                            setQuizForOptions(quiz);
                          }}
                        >
                          <span>Options</span>
                        </DropdownMenuItem>

                        {/* "Delete" */}
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => {
                            // "Delete" automatically closes the dropdown, then opens the Delete modal
                            handleDeleteClick(quiz);
                          }}
                        >
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Link href="/dashboard/create">
        <Button className="w-full max-w-7xl my-6">+ Create New</Button>
      </Link>

      <Separator className="my-6 max-w-7xl" />
      <h2 className="text-xl font-semibold my-4">Explore Public Quizzes</h2>
      {publicQuizzes.length === 0 ? (
        <p className="text-center text-gray-500">
          No public quizzes available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-7xl">
          {publicQuizzes.map((quiz) => (
            <Card key={quiz.id} className="w-full">
              <div className="flex flex-row">
                <div className="relative flex items-center px-6 justify-center">
                  <MdChecklist className="h-12 w-12" />
                </div>
                <div className="flex flex-col justify-center w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                      {quiz.title}
                    </CardTitle>
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <span>{quiz.questions?.length || 0} questions</span>
                      <span>Created by {quiz.username || "Anonymous"}</span>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex gap-2 pt-2">
                    <Link href={`/dashboard/${encodeURIComponent(formatTitle(quiz.title))}`} className="flex-1">
                      <Button className="w-full">Take Quiz</Button>
                    </Link>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <DeleteQuizModal
        isOpen={deleteModalOpen}
        onOpenChange={(open) => { 
          setDeleteModalOpen(open); 
          if (!open) setTimeout(() => window.location.reload(), 2000);
        }}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        quizTitle={selectedQuiz?.title}
      />

      <RenameQuizModal
        isOpen={!!quizToRename}
        onClose={() => { 
          setQuizToRename(null); 
          setTimeout(() => window.location.reload(), 1000);
        }}
        onRename={handleRename}
        currentTitle={quizToRename?.title || ""}
      />

      <QuizOptionsModal
        isOpen={!!quizForOptions}
        onClose={() => { 
          setQuizForOptions(null); 
          setTimeout(() => window.location.reload(), 1000);
        }}
        onSave={handleOptionsUpdate}
        quiz={quizForOptions}
      />
    </div>
  );
}