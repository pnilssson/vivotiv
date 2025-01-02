export default function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center">
      <div className="w-full max-w-sm -mt-64">{children}</div>
    </div>
  );
}
