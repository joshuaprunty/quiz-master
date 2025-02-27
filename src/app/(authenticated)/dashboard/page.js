"use client";
import DeleteQuizModal from "@/components/DeleteQuizModal";
import { useAuthContext } from "@/context/AuthContext";
import deleteQuiz from "@/firebase/firestore/deleteQuiz";
import getUserQuizzes from "@/firebase/firestore/getUserQuizzes";
import { getPublicQuizzes } from "@/firebase/firestore/publicQuizzes";
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
  const [quizzes, setQuizzes] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToRename, setQuizToRename] = useState(null);
  const [quizForOptions, setQuizForOptions] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user == null) {
      router.push("/");
      return;
    }

    const fetchQuizzes = async () => {
      // Fetch user's quizzes
      const { result: userQuizzes, error: userError } = await getUserQuizzes(user.uid);
      if (userError) {
        console.error("Error fetching user quizzes:", userError);
        return;
      }
      setQuizzes(userQuizzes);

      // Fetch public quizzes
      const { result: publicQuizzes, error: publicError } = await getPublicQuizzes();
      if (publicError) {
        console.error("Error fetching public quizzes:", publicError);
        return;
      }
      // Filter out user's own quizzes from public quizzes
      const filteredPublicQuizzes = publicQuizzes.filter(quiz => quiz.userId !== user.uid);
      setPublicQuizzes(filteredPublicQuizzes);

      setLoading(false);
    };

    fetchQuizzes();
  }, [user, router]);

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
  
      // Refresh quizzes list
      const { result } = await getUserQuizzes(user.uid);
      setQuizzes(result);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false); // close the modal
      setSelectedQuiz(null);
    }
  };

  const handleRename = async (newTitle) => {
    if (!quizToRename) return;
    
    try {
      const updatedQuiz = { ...quizToRename, title: newTitle };
      const { error } = await updateQuiz(user.uid, quizToRename.id, updatedQuiz);
      
      if (error) throw new Error(error);
      
      // Update local state
      setQuizzes(prevQuizzes => 
        prevQuizzes.map(quiz => 
          quiz.id === quizToRename.id ? { ...quiz, title: newTitle } : quiz
        )
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

  const handleOptionsUpdate = async (options) => {
    if (!quizForOptions) return;
    
    try {
      const updatedQuiz = { ...quizForOptions, ...options };
      const { error } = await updateQuiz(user.uid, quizForOptions.id, updatedQuiz);
      
      if (error) throw new Error(error);
      
      // Update local state
      setQuizzes(prevQuizzes => 
        prevQuizzes.map(quiz => 
          quiz.id === quizForOptions.id ? { ...quiz, ...options } : quiz
        )
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

  const formatTitle = (title) => {
    const tit = title.replace(/ /g, "-");
    return tit;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold my-2">Dashboard</h1>
      {/* <p className="my-2">Welcome to your dashboard!</p> */}

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
                    <Link
                      href={`/dashboard/${formatTitle(quiz.title)}`}
                      className="flex-1"
                    >
                      <Button className="w-full">View</Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <TbSettings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setQuizToRename(quiz)}>
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setQuizForOptions(quiz)}>
                          <span>Options</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(quiz)}
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
                      <span>Created by {quiz.username || 'Anonymous'}</span>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex gap-2 pt-2">
                    <Link
                      href={`/dashboard/${formatTitle(quiz.title)}`}
                      className="flex-1"
                    >
                      <Button className="w-full">Take Quiz</Button>
                    </Link>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeleteQuizModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}  // pass the state setter
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        quizTitle={selectedQuiz?.title}
      />

      <RenameQuizModal 
        isOpen={!!quizToRename}
        onClose={() => setQuizToRename(null)}
        onRename={handleRename}
        currentTitle={quizToRename?.title || ''}
      />

      <QuizOptionsModal 
        isOpen={!!quizForOptions}
        onClose={() => setQuizForOptions(null)}
        onSave={handleOptionsUpdate}
        quiz={quizForOptions}
      />
    </div>
  );
}
