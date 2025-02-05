import Image from "next/image";
import { Section } from '@/components/Section';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen font-[family-name:var(--font-sans)]">
      <Section backgroundColor="#f6f7fb">
        <div className="min-h-[50vh] flex items-center">
          <div className="py-20 flex flex-col gap-8 items-center text-center w-full">
            <h1 className="text-6xl font-bold text-blue-700">QuizWiz</h1>
            <p className="text-xl">Create quizzes from learning materials with AI.</p>
            <Link href="/signup" passHref>
              <Button
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                rel="noopener noreferrer"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      <Section backgroundColor="#ffffff">
        <div className="py-24 w-full">
          <h2 className="text-3xl font-bold mb-12">First Section</h2>
          <Carousel 
            className="mx-auto"
            opts={{
              loop: true,
              align: "start",
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                { title: "Study Smart", description: "Efficient learning techniques" },
                { title: "Quick Quizzes", description: "Test your knowledge" },
                { title: "Track Progress", description: "Monitor your improvement" },
                { title: "AI-Powered", description: "Intelligent question generation" },
                { title: "Customizable", description: "Tailor to your needs" },
              ].map((item, index) => (
                <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4 m-3">
                  <Card className="h-full transition-transform duration-200 hover:scale-105 px-2">
                    <div className="relative h-64">
                      <Image
                        src="/studying.jpg"
                        alt="Students studying"
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              className="h-12 w-12 md:h-16 md:w-16" 
            />
            <CarouselNext 
              className="h-12 w-12 md:h-16 md:w-16" 
            />
          </Carousel>
        </div>
      </Section>

      <Section backgroundColor="#f6f7fb" className="flex items-center">
        <div className="py-16">
          <h2 className="text-3xl font-bold mb-12">Second Section</h2>
          <Card className="w-full mx-auto my-12">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-[300px] md:h-full">
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
          <Card className="w-full mx-auto my-12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
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
              <div className="relative h-[300px] md:h-full">
                <Image
                  src="/studying.jpg"
                  alt="Students studying"
                  fill
                  className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                />
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section backgroundColor="#ffffff" className="flex items-center">
        <div className="py-24">
          <h2 className="text-3xl font-bold mb-12">Third Section</h2>
          <Card className="w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-[300px] md:h-full">
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
      </Section>
    </main>
  );
}