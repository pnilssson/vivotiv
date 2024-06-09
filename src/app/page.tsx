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
          <Card className="border-0 shadow-md">
            <CardHeader className="md:min-h-80">
              <Image
                src="/undraw_switches.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>1. Configure</CardTitle>
              <CardDescription className="text-md">
                The programs will be tailor-made based on your needs and takes
                previous experience, injures, available equipment, goals and
                more in consideration.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="md:min-h-80">
              <Image
                src="/undraw_data_processing.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>2. Generate</CardTitle>
              <CardDescription className="text-md">
                We use AI to generate personalized traning program based on your
                configuration. We will offer you multiple suggestions to choose
                from.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="md:min-h-80">
              <Image
                src="/undraw_personal_trainer.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>3. Execute</CardTitle>
              <CardDescription className="text-md">
                The fun part! Execute the program we provide you with and reap
                the benefits of regular exercise. No need for a gym membership
                or external equipment.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="md:min-h-80">
              <Image
                src="/undraw_set_preferences.svg"
                alt="Configure"
                width={100}
                height={100}
                className="mb-8 self-center h-20"
              />
              <CardTitle>4. Repeat</CardTitle>
              <CardDescription className="text-md">
                Fine tune the configuration, repeat the process and stay
                healthy.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      <section className="flex flex-col justify-center container mt-16 md:mt-32 py-12 ">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-bold mt-2 md:mt-4">
            Pricing
          </h2>
          <p className="md:text-xl text-muted-foreground md:max-w-[600px] mx-auto mt-2 md:mt-4">
            One time payments only, not another subscriptions to keep track of.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-[1024px]">
          <Card>
            <CardHeader className="md:min-h-80">
              <CardTitle className="text-lg">Get started</CardTitle>
              <CardTitle className="text-3xl font-extrabold">€17<span className="text-sm">/month</span></CardTitle>
              <CardDescription className="text-md">
              The 21/90 rule states that it takes 21 days to make a habit.
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
          <Card>
            <CardHeader className="md:min-h-80">
              <CardTitle className="text-lg">Create a lifestyle</CardTitle>
              <CardTitle className="text-3xl font-extrabold">€12<span className="text-sm">/month</span></CardTitle>
              <CardDescription className="text-md">
                It takes 90 days to make it a permanent lifestyle change.
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
          <Card>
            <CardHeader className="md:min-h-80">
            <CardTitle className="text-lg">Never look back</CardTitle>
              <CardTitle className="text-3xl font-extrabold">€7<span className="text-sm">/month</span></CardTitle>
              <CardDescription className="text-md">
              Creating a healthy lifestyle is not a sprint, it is a marathon.
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
