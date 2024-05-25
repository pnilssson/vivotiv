import GridPattern from "@/components/magicui/grid-pattern";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ResetIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export default function Page() {
  return (
    <>
      <header className="flex flex-col text-center pt-36 md:pt-48 container">
        <h1 className="text-4xl md:text-8xl font-bold md:max-w-[980px] mx-auto">
          Start training from home{" "}
          <span className="underline decoration-emerald-400 underline-offset-4">
            today
          </span>
        </h1>
        <h2 className="text-2xl md:text-6xl font-semibold mt-2 md:mt-4 text-emerald-400">
          With tailor-made programs
        </h2>
        <p className="md:text-xl text-muted-foreground md:max-w-[600px] mx-auto mt-2 md:mt-4">
          Transform your health with personalized training programs created to
          suit your needs.
        </p>
        <GridPattern
          width={30}
          height={30}
          className={cn(
            "[mask-image:linear-gradient(to_bottom,transparent,white,transparent)] h-[440px] md:h-[720px] -z-10 mt-16  "
          )}
        />
      </header>
      <section className="flex flex-col container mt-48 md:mt-64 py-12 max-w-[90%] rounded-xl bg-gradient-to-b from-emerald-100 to-white">
        <div className="text-center mb-8">
          <p className="flex flex-row font-semibold text-emerald-400 justify-center">
            Easy as 1, 2, 3, <ResetIcon className="ml-1 mt-1" />
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold mt-2 md:mt-4">
            How it works?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <Image
                src="/undraw_switches.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>1. Configure</CardTitle>
              <CardDescription className="text-md">
                The program will be tailored based on amount of sessions, time
                per session, experience, injures, available equipment, your
                goals and more.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Image
                src="/undraw_data_processing.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>2. Generate</CardTitle>
              <CardDescription className="text-md">
                We are using AI to generate personalized traning program based
                on your configuration.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Image
                src="/undraw_personal_trainer.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>3. Execute</CardTitle>
              <CardDescription className="text-md">
                The fun part! There is no shortcuts when it comes to do the
                work.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Image
                src="/undraw_set_preferences.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>4. Repeat</CardTitle>
              <CardDescription className="text-md">
                Fine tune the configuration, repeat the process and reap the
                benefits of regular exercise.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </>
  );
}
