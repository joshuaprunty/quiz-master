"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import getUserQuizzes from "@/firebase/firestore/getUserQuizzes";
import { getPublicQuizzes } from "@/firebase/firestore/publicQuizzes";
import { MdChecklist } from "react-icons/md";

export default function SubjectPage({ params }) {
  const { subjectname } = use(params);
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  useEffect(() => {
    if (!user) {
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

      // Fetch public quizzes
      const { result: publicQuizzes, error: publicError } = await getPublicQuizzes();
      if (publicError) {
        console.error("Error fetching public quizzes:", publicError);
        return;
      }

      // Filter out user's own quizzes from public quizzes
      const filteredPublicQuizzes = publicQuizzes.filter(quiz => quiz.userId !== user.uid);
      
      // Combine user's quizzes and public quizzes
      setAvailableQuizzes([...userQuizzes, ...filteredPublicQuizzes]);
      setLoading(false);
    };

    const formattedName = subjectname.replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    setSubject({ name: formattedName });
    fetchQuizzes();
  }, [user, subjectname, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{subject.name}</h1>
        <Link href="/dashboard/subjects">
          <Button variant="outline">Back to Subjects</Button>
        </Link>
      </div>

      <Separator className="my-6" />

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {availableQuizzes.map((quiz) => (
              <Card key={quiz.id} className="w-full">
                <div className="flex flex-row">
                  <div className="relative flex items-center px-6 justify-center">
                    <MdChecklist className="h-12 w-12" />
                  </div>
                  <div className="flex flex-col justify-center w-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {quiz.questions?.length || 0} questions
                      </p>
                    </CardHeader>
                    <CardFooter className="flex gap-2 pt-2">
                      <Button 
                        className="w-full"
                        onClick={() => console.log('Add quiz to subject:', quiz.id)}
                      >
                        Add to Subject
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}