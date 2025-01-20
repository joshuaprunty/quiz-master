import FileUpload from "@/components/FileUpload";

export default function Create() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Create Quiz</h1>
      <p className="mt-4">Initialize quiz generation</p>
      <FileUpload />
    </div>
  )
}