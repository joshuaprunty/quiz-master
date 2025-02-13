"use client";

import { useAuthContext } from "@/context/AuthContext";
import getUserQuizResults from "@/firebase/firestore/getUserQuizResults";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function ScoresPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchQuizResults = async () => {
      const { result, error } = await getUserQuizResults(user.uid);
      if (error) {
        console.error("Error fetching quiz results:", error);
        return;
      }
      setQuizResults(result);
      setLoading(false);
    };

    fetchQuizResults();
  }, [user, router]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold my-2">Quiz Results</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Separator className="my-6" />

      {quizResults.length === 0 ? (
        <p className="text-center text-gray-500">
          No quiz results yet. Take your first quiz!
        </p>
      ) : (
        <div className="space-y-4">
          {quizResults.map((result) => (
            <Card key={result.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col">
                  <CardTitle className="text-xl">{result.quizTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Taken on {formatDate(result.timestamp)}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-xl font-semibold">
                    {result.correctAnswers}/{result.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.score}%
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}