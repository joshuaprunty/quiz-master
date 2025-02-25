"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";


export default function SubjectPage({ params }) {
  const { subjectname } = use(params);
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // Format the subject name for display
    const formattedName = subjectname.replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    setSubject({ name: formattedName });
    setLoading(false);
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

      <p className="text-center text-gray-500">
        No quizzes have been added to this subject yet.
      </p>
    </div>
  );
}