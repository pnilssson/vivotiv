export default function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex md:h-[calc(100vh-72px)] w-full items-center justify-center">
      <div className="max-w-sm md:-mt-64">{children}</div>
    </div>
  );
}
