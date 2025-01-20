import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function QuizPage({ params }) {
  const { quizname } = params;
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold my-4">Quiz Details</h1>
      <p className="my-4">Viewing quiz: {quizname}</p>
      <Button className="w-full my-4 max-w-3xl">
        <Link href="/dashboard">
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}