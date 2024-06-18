"use client";

import Nav from "./nav";

export default function Component({ children }: { children: React.ReactNode }) {
  return (
    <aside className="relative hidden lg:flex h-[calc(100vh-60px)] border-r w-full max-w-[18rem] flex-col p-6">
      <Nav>{children}</Nav>
    </aside>
  );
}
