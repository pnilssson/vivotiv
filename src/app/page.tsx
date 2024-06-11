import GetStartedButton from "@/components/buttons/get-started-button";
import Footer from "@/components/footer";
import GridPattern from "@/components/magicui/grid-pattern";
import ShineBorder from "@/components/magicui/shine-border";
import { cn } from "@/lib/utils";
import {
  Crosshair2Icon,
  GearIcon,
  LoopIcon,
  MagicWandIcon,
  ResetIcon,
} from "@radix-ui/react-icons";

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
      <section className="flex flex-col container mt-48 md:mt-64">
        <div className="mb-8 rounded-xl bg-gradient-to-br from-emerald-100 to-sky-100 px-8 md:px-24 py-12">
          <p className="flex flex-row font-semibold text-emerald-400">
            Easy as 1, 2, 3, <ResetIcon className="ml-1 mt-1" />
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold mt-2 md:mt-4">
            How it works?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-[540px]">
            It will only take a few minutes to prepare your first month of
            training. Not sure? We offer a week worth of training for free.
          </p>
          <GetStartedButton
            content="Try for free"
            classes="text-xs px-4 py-2 mt-6 bg-slate-800/25 hover:bg-slate-800/35 shadow-lg h-8"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-24 mt-12">
            <div className="flex flex-col items-start">
              <div className="p-2 rounded-lg bg-white">
                <GearIcon className="w-8 h-8" />
              </div>
              <div className="text-start">
                <h3 className="text-lg font-semibold tracking-tight mt-4">
                  Configure
                </h3>
                <p className="text-muted-foreground mt-4">
                  The programs will be tailor-made based on your needs and takes
                  previous experience, injures, available equipment, goals and
                  more in consideration.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="p-2 rounded-lg bg-white">
                <MagicWandIcon className="w-8 h-8" />
              </div>
              <div className="text-start">
                <h3 className="text-lg font-semibold tracking-tight mt-4">
                  Generate
                </h3>
                <p className="text-muted-foreground mt-4">
                  We use AI to generate personalized traning program based on
                  your configuration. We will offer you multiple suggestions to
                  choose from.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="p-2 rounded-lg bg-white">
                <Crosshair2Icon className="w-8 h-8" />
              </div>
              <div className="text-start">
                <h3 className="text-lg font-semibold tracking-tight mt-4">
                  Execute
                </h3>
                <p className="text-muted-foreground mt-4">
                  The fun part! Execute the program we provide you with and reap
                  the benefits of regular exercise. No need for a gym membership
                  or external equipment.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="p-2 rounded-lg bg-white">
                <LoopIcon className="w-8 h-8" />
              </div>
              <div className="text-start">
                <h3 className="text-lg font-semibold tracking-tight mt-4">
                  Repeat
                </h3>
                <p className="text-muted-foreground mt-4">
                  Fine tune the configuration, repeat the process and stay
                  healthy.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"></div>
      </section>
      <section className="py-10 bg-white sm:py-16 lg:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-semibold mt-2 md:mt-4">
              Pricing & Plans
            </h2>
            <p className="text-muted-foreground mt-4 max-w-80 md:max-w-xl mx-auto">
              One time payments only, not another subscriptions to keep track
              of.
            </p>
          </div>
          <div className="grid max-w-md grid-cols-1 gap-6 mx-auto mt-6 lg:max-w-full lg:mt-16 lg:grid-cols-3">
            <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:h-[90%] md:my-auto">
              <div className="p-8 xl:px-12">
                <h3 className="text-base font-semibold text-purple-600">
                  Get started
                </h3>
                <p className="text-5xl font-bold text-black mt-7">
                  €17<span className="text-sm">/month</span>
                </p>
                <p className="mt-2 text-base text-muted-foreground">
                  One-time payment
                </p>
                <p className="my-8">
                  The 21/90 rule states that it takes 21 days to make a habit.
                  Get started with one month worth of training program.
                </p>
                <GetStartedButton
                  content="Get started"
                  classes="py-4 mt-6 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full"
                />
              </div>
            </div>

            <ShineBorder
              className="overflow-hidden bg-white rounded-lg shadow-lg"
              color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}>
              <div className="p-8 xl:px-12">
                <h3 className="text-base font-semibold text-purple-600">
                  Create a lifestyle
                </h3>
                <p className="text-5xl font-bold text-black mt-7">
                  €12<span className="text-sm">/month</span>
                </p>
                <p className="mt-2 text-base text-gray-600">One-time payment</p>
                <p className="my-8">
                  It takes 90 days to make it a permanent lifestyle change. Get
                  the possibility to generate three months of training program.
                </p>
                <GetStartedButton
                  content="Get started"
                  classes="py-4 mt-6 bg-gradient-to-br from-emerald-400 to-sky-400 hover:from-emerald-400/35 hover:to-sky-400/75 shadow-lg w-full"
                />
              </div>
            </ShineBorder>

            <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:h-[90%] md:my-auto">
              <div className="p-8 xl:px-12">
                <h3 className="text-base font-semibold text-purple-600">
                  Never look back
                </h3>
                <p className="text-5xl font-bold text-black mt-7">
                  €7<span className="text-sm">/month</span>
                </p>
                <p className="mt-2 text-base text-gray-600">One-time payment</p>
                <p className="my-8">
                  But creating a healthy lifestyle is not a sprint, it is a
                  marathon. Get 12 months of training program.
                </p>
                <GetStartedButton
                  content="Get started"
                  classes="py-4 mt-6 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
