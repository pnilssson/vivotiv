import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";
import type { ReactNode } from "react";

type OutreachEmailProps = {
  body: string;
  resultsUrl: string;
  unsubscribeUrl: string;
};

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      },
      colors: {
        bg: "#f8f7f4",
        fg: "#1a1a1a",
      },
    },
  },
};

const URL_REGEX = /https?:\/\/[^\s]+/g;

function linkifyText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const url = match[0];
    const index = match.index;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <Link key={index} href={url} className="text-fg underline">
        {url}
      </Link>,
    );

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function OutreachEmail({
  body,
  resultsUrl,
  unsubscribeUrl,
}: OutreachEmailProps) {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head />
        <Preview>Vi analyserade er hemsida och hittade några saker vi ville dela</Preview>
        <Body className="m-0 bg-bg p-0 font-sans">
          <Container className="mx-auto max-w-[560px] py-[40px]">
            <Section className="px-[16px]">
              {body.split("\n\n").map((paragraph, i) => (
                <Text
                  key={i}
                  className="m-0 mb-[16px] text-[15px] leading-[1.6] text-fg"
                >
                  {linkifyText(paragraph)}
                </Text>
              ))}
            </Section>

            <Section className="px-[16px] pt-[8px] text-center">
              <Text className="m-0 text-[12px] leading-normal text-[#999999]">
                Detta mail skickades av{" "}
                <Link href={resultsUrl} className="text-[#999999] underline">
                  Vivotiv
                </Link>
                .
              </Text>
              <Text className="m-0 mt-[4px] text-[12px] leading-normal text-[#999999]">
                <Link href={unsubscribeUrl} className="text-[#999999] underline">
                  Avsluta prenumeration
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
