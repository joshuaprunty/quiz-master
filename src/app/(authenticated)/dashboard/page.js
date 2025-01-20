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


export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="my-4">Welcome to your dashboard!</p>
      <Button className="w-full max-w-7xl my-12">
        <Link href="/dashboard/create">
          + Create Quiz
        </Link>
      </Button>
      <Card className="w-full max-w-7xl my-2">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[200px] md:h-full">
            <Image
              src="/studying.jpg"
              alt="Students studying"
              fill
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            />
          </div>
          <div className="p-6 flex flex-col justify-center min-h-[30vh]">
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl">Card Title</CardTitle>
                <CardDescription>This is a brief description of the card content.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </CardContent>
            </div>
            <CardFooter className="p-0 mt-4">
              <Button className="w-full">Learn More</Button>
            </CardFooter>
          </div>
        </div>
      </Card>
      <Card className="w-full max-w-7xl my-12">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[200px] md:h-full">
            <Image
              src="/studying.jpg"
              alt="Students studying"
              fill
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            />
          </div>
          <div className="p-6 flex flex-col justify-center min-h-[30vh]">
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl">Card Title</CardTitle>
                <CardDescription>This is a brief description of the card content.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </CardContent>
            </div>
            <CardFooter className="p-0 mt-4">
              <Button className="w-full">Learn More</Button>
            </CardFooter>
          </div>
        </div>
      </Card>
      <Card className="w-full max-w-7xl my-12">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[200px] md:h-full">
            <Image
              src="/studying.jpg"
              alt="Students studying"
              fill
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            />
          </div>
          <div className="p-6 flex flex-col justify-center min-h-[30vh]">
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl">Card Title</CardTitle>
                <CardDescription>This is a brief description of the card content.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </CardContent>
            </div>
            <CardFooter className="p-0 mt-4">
              <Button className="w-full">Learn More</Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  )
}