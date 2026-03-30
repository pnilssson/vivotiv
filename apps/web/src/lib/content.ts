import { readFile, readdir } from "fs/promises";
import path from "path";

import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export type ContentFrontmatter = {
  title: string;
  description: string;
  lastUpdated: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "pages");

export async function getContentPage(slug: string, locale: string) {
  const filePath = path.join(CONTENT_DIR, slug, `${locale}.mdx`);
  const source = await readFile(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<ContentFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return { content, frontmatter };
}

export async function getAllContentSlugs() {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}
