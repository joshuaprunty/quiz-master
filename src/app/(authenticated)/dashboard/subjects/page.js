"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreateSubjectModal from "@/components/CreateSubjectModal";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { saveSubject, getUserSubjects } from "@/firebase/firestore/subjectOperations";
import { useToast } from "@/hooks/use-toast";
import { IoBookOutline } from "react-icons/io5";
import Link from "next/link";

export default function SubjectsPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);

  // Load subjects when page loads
  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchSubjects = async () => {
      const { result, error } = await getUserSubjects(user.uid);
      if (error) {
        console.error("Error fetching subjects:", error);
        return;
      }
      setSubjects(result);
    };

    fetchSubjects();
  }, [user, router]);

  const handleCreateSubject = async (subjectName) => {
    setIsLoading(true);
    try {
      const { result, error } = await saveSubject(user.uid, {
        name: subjectName,
      });

      if (error) {
        throw error;
      }

      setSubjects(prev => [...prev, { id: result.id, name: subjectName }]);
      setIsModalOpen(false);
      toast({
        title: "Success",
        description: "Subject created successfully!",
      });
    } catch (error) {
      console.error("Error creating subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create subject. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Subjects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Create Subject
        </Button>
      </div>

      <Separator className="my-6" />

      {subjects.length === 0 ? (
        <p className="text-center text-gray-500">
          No subjects created yet. Create your first subject!
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="w-full">
              <div className="flex flex-row">
                <div className="relative flex items-center px-6 justify-center">
                  <IoBookOutline className="h-12 w-12" />
                </div>
                <div className="flex flex-col justify-center w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{subject.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="flex gap-2 pt-2">
                    <Link
                      href={`/dashboard/subjects/${subject.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex-1"
                    >
                      <Button className="w-full">View Subject</Button>
                    </Link>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateSubject}
        loading={isLoading}
      />
    </div>
  );
}