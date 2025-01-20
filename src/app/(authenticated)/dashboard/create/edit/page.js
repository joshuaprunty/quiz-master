import FileUpload from "@/components/FileUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image";
import Link from "next/link";


export default function Create() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Edit quiz output</h1>
      <p className="mt-4">Edit the quiz output</p>
    </div>
  )
}