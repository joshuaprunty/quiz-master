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
import { Separator } from "@/components/ui/separator";
import { slugify } from "@/lib/utils";


export default function Dashboard() {
  const cardData = [
    {
      title: "Quiz A",
      description: "Quiz description",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      title: "Quiz B",
      description: "Quiz description",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      title: "Quiz C",
      description: "Quiz description",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold my-2">Dashboard</h1>
      <p className="my-2">Welcome to your dashboard!</p>
      <Button className="w-full max-w-7xl my-2">
        <Link href="/dashboard/create">
          + Create Quiz
        </Link>
      </Button>
      <Separator className="my-6 max-w-7xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
        {cardData.map((card, index) => (
          <Card key={index} className="w-full">
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
                    <CardTitle className="text-2xl">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <p className="text-gray-600">{card.content}</p>
                  </CardContent>
                </div>
                <CardFooter className="p-0 mt-4">
                  <Link href={`/dashboard/${slugify(card.title)}`}>
                    <Button className="w-full">View</Button>
                  </Link>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}