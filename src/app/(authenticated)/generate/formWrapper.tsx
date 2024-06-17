import clsx from "clsx";

export default function FormWrapper({
  children,
  heading,
  description,
}: {
  children: React.ReactNode;
  heading: string;
  description: string;
}) {
  return (
    <section
      className={clsx(
        "flex flex-col w-full h-min-full",
        "px-6 lg:px-[100px] pt-6 lg:pt-12 pb-8 lg:pb-4",
        "bg-white lg:bg-transparent rounded-lg lg:rounded-none shadow-lg lg:shadow-none"
      )}>
      <h1 className="text-2xl lg:text-3xl font-bold">{heading}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
      {children}
    </section>
  );
}
