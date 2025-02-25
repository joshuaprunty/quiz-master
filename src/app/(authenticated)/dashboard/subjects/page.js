"use client";
import { Button } from "@/components/ui/button";
import CreateSubjectModal from "@/components/CreateSubjectModal";
import { useState } from "react";

export default function SubjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSubject = async (subjectName) => {
    setIsLoading(true);
    try {
      // Add your subject creation logic here
      console.log("Creating subject:", subjectName);
      // After successful creation:
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating subject:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Your Subjects</h1>
      <p className="mt-4">Manage your quiz subjects</p>
      <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
        Create Subject
      </Button>

      <CreateSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateSubject}
        loading={isLoading}
      />
    </div>
  );
}