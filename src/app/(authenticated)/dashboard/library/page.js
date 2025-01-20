'use client'
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getUserQuizzes from "@/firebase/firestore/getUserQuizzes";

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

export default function Dashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold my-2">Library</h1>
      <p className="my-2">Welcome to your library!</p>
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
                    <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-0 mt-4">
                    <Link href={`/dashboard/${slugify(quiz.title)}`}>
                      <Button className="w-full">View</Button>
                    </Link>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}