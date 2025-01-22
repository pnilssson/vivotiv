"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SectionContent from "./lading-page/section-content";
import ContentBox from "./shared/content-box";
import Title from "./shared/typography/title";

export default function Component() {
  const pathname = usePathname();
  return (
    <SectionContent className="container p-4 sticky top-0 z-50">
      <ContentBox className="flex flex-row justify-between px-4 py-2">
        <Button variant="link" className="p-0" size="sm">
          <Title className="text-xl">
            <Link href="/">Vivotiv</Link>
          </Title>
        </Button>
        {pathname.startsWith("/auth") ? null : (
          <Button asChild className="!ml-auto" size="sm">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        )}
      </ContentBox>
    </SectionContent>
  );
}
