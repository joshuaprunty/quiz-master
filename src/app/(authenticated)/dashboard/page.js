'use client'
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getUserQuizzes from "@/firebase/firestore/getUserQuizzes";
import deleteQuiz from "@/firebase/firestore/deleteQuiz";
import DeleteQuizModal from "@/components/DeleteQuizModal";
import { TbSettings } from "react-icons/tb"


import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { slugify } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user == null) {
      router.push("/");
      return;
    }

    const fetchQuizzes = async () => {
      const { result, error } = await getUserQuizzes(user.uid);
      if (error) {
        console.error('Error fetching quizzes:', error);
        return;
      }
      setQuizzes(result);
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
        console.error('Error deleting quiz:', error);
        return;
      }
      
      // Refresh quizzes list
      const { result } = await getUserQuizzes(user.uid);
      setQuizzes(result);
    } catch (error) {
      console.error('Error deleting quiz:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedQuiz(null);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold my-2">Dashboard</h1>
      <p className="my-2">Welcome to your dashboard!</p>
      <Button className="w-full max-w-7xl my-2">
        <Link href="/dashboard/create">
          + Create Quiz
        </Link>
      </Button>
      <Separator className="my-6 max-w-7xl" />
      {quizzes.length === 0 ? (
        <p className="text-center text-gray-500">No quizzes created yet. Create your first quiz!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[200px] md:h-full">
                  <Image
                    src="/studying.jpg"
                    alt="Quiz thumbnail"
                    fill
                    className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                  />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl break-words hyphens-auto overflow-wrap-anywhere">{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-0 mt-4 flex gap-2">
                    <Link href={`/dashboard/${slugify(quiz.title)}`} className="flex-1">
                      <Button className="w-full">View</Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <TbSettings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteClick(quiz)}
                        >
                          Delete
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
      
      <DeleteQuizModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedQuiz(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        quizTitle={selectedQuiz?.title}
      />
    </div>
  );
}