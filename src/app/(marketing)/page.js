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

export default function Home() {
  return (
    <main className="min-h-screen font-[family-name:var(--font-sans)]">
      <Section backgroundColor="#f6f7fb">
        <div className="min-h-[50vh] flex items-center">
          <div className="py-20 flex flex-col gap-8 items-center text-center w-full">
            <h1 className="text-6xl font-bold text-blue-700">QuizWiz</h1>
            <p className="text-xl">Create quizzes from learning materials with AI.</p>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href="/login"
                rel="noopener noreferrer"
              >
                Sign Up
              </a>
              <a
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                href="/about"
                rel="noopener noreferrer"
              >
                Read More
              </a>
            </div>
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
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <Card className="h-full">
                    <div className="relative h-48">
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
        <div className="py-24">
          <h2 className="text-3xl font-bold mb-12">Second Section</h2>
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