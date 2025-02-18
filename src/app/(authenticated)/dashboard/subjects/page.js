import { Button } from "@/components/ui/button";

export default function SubjectsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Your Subjects</h1>
      <p className="mt-4">Manage your quiz subjects</p>
      <Button className="mt-6">
        Create Subject
      </Button>
    </div>
  );
}