import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Create() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Create a new quiz</h1>
      <p className="mt-4">Upload or paste study materials for quiz generation</p>
      <FileUpload />
      {/* <Button className="w-full max-w-4xl my-12">
        <Link href="/dashboard/create/settings">
          Next
        </Link>
      </Button> */}
    </div>
  );
}
