import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogGallery, { BlogGalleryImage } from "@/components/blog/BlogGallery";
import { buildMetadata } from "@/utils/seo";
import { siteMetaData } from "@/utils/siteMetaData";

const BackButton = dynamic(() => import("@/components/ui/BackButton"));

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  content?: string | null;
  excerpt?: string | null;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText?: string | null;
    } | null;
  } | null;
  categories?: {
    nodes: Category[];
  } | null;
};

type GraphQLVariables = Record<string, string | number | boolean | null | undefined>;

type GraphQLResponse<T> = {
  data: T;
  errors?: unknown;
};

const WP_GRAPHQL_URL =
  process.env.WP_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_URL;

async function fetchGraphQL<T>(
  query: string,
  variables?: GraphQLVariables,
  revalidateSeconds = 300
): Promise<T> {
  if (!WP_GRAPHQL_URL) {
    throw new Error("WP GraphQL URL nije definisan (.env)");
  }

  const res = await fetch(WP_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    console.error("GraphQL HTTP error:", res.status, await res.text());
    throw new Error(`GraphQL HTTP error: ${res.status}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("GraphQL response sadrži errors");
  }

  return json.data;
}

const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      date
      title
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

async function getPost(slug: string): Promise<Post | null> {
  try {
    const data = await fetchGraphQL<{ post: Post | null }>(GET_POST_BY_SLUG, { slug }, 300);
    return data.post ?? null;
  } catch (err) {
    console.error("❌ getPost GraphQL error:", err);
    return null;
  }
}

// --------------------
// Helpers
// --------------------
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input: string, max = 160): string {
  const s = input.trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function extractImagesFromHtml(html: string, fallbackAlt: string): BlogGalleryImage[] {
  if (!html) return [];

  const imgRegex = /<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi;
  const altRegex = /alt=['"]([^'"]*)['"]/i;

  const results: BlogGalleryImage[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (!src || seen.has(src)) continue;

    const fullTag = match[0];
    const altMatch = fullTag.match(altRegex);
    const alt = altMatch?.[1] || fallbackAlt;

    seen.add(src);
    results.push({ sourceUrl: src, altText: alt });
  }

  return results;
}

function stripImagesFromHtml(html: string): string {
  if (!html) return "";
  let cleaned = html.replace(/<figure[\s\S]*?<\/figure>/gi, "");
  cleaned = cleaned.replace(/<img[^>]*>/gi, "");
  return cleaned;
}

// --------------------
// JSON-LD (BlogPosting)
// --------------------
type BlogPostingJsonLd = {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage: string;
  image?: string[];
  description?: string;
  publisher?: {
    "@type": "Organization";
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
};

function buildBlogJsonLd(post: Post, ogImage: string, description: string): BlogPostingJsonLd {
  const url = `${siteMetaData.siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    mainEntityOfPage: url,
    image: ogImage ? [ogImage] : undefined,
    description,
    publisher: {
      "@type": "Organization",
      name: siteMetaData.brand,
      // ako imaš logo url u siteMetaData, ubaci ovde:
      // logo: { "@type": "ImageObject", url: siteMetaData.logo },
    },
  };
}

// --------------------
// Metadata
// --------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    return buildMetadata({
      title: siteMetaData.pages.blog.title,
      description: "Blog objava nije pronađena.",
      path: `/blog/${slug}`,
      ogImage: siteMetaData.pages.blog.banner,
      noIndex: true,
    });
  }

  const title = post.title?.trim() || "Blog";
  const excerptText = post.excerpt ? stripHtml(post.excerpt) : "";

  const description =
    truncate(excerptText, 160) || truncate("Blog objava na Živić elektro materijal sajtu.", 160);

  const ogImage = post.featuredImage?.node?.sourceUrl || siteMetaData.pages.blog.banner;

  const base = buildMetadata({
    title: `${title} | Blog`,
    description,
    path: `/blog/${post.slug}`,
    ogImage,
  });

  return {
    ...base,
    openGraph: {
      ...(base.openGraph ?? {}),
      type: "article",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.featuredImage?.node?.altText || title,
        },
      ],
    },
  };
}

// --------------------
// Page
// --------------------
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug);
  if (!post) notFound();

  const mainCategory = post.categories?.nodes?.[0];

  const featured: BlogGalleryImage | null =
    post.featuredImage?.node?.sourceUrl
      ? {
          sourceUrl: post.featuredImage.node.sourceUrl,
          altText: post.featuredImage.node.altText || post.title,
        }
      : null;

  const contentImages = extractImagesFromHtml(post.content || "", post.title);

  const allImagesMap = new Map<string, BlogGalleryImage>();
  if (featured) allImagesMap.set(featured.sourceUrl, featured);
  for (const img of contentImages) {
    if (!allImagesMap.has(img.sourceUrl)) allImagesMap.set(img.sourceUrl, img);
  }

  const allImages = Array.from(allImagesMap.values());
  const cleanedContent = stripImagesFromHtml(post.content || "");

  const ogImage = post.featuredImage?.node?.sourceUrl || siteMetaData.pages.blog.banner;
  const description =
    truncate(stripHtml(post.excerpt || ""), 160) || truncate("Blog objava na Živić elektro materijal sajtu.", 160);

  const jsonLd = buildBlogJsonLd(post, ogImage, description);

  return (
    <main className="relative min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 -top-40 h-72 bg-linear-to-b from-cyan-500/25 via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-32 top-64 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-32 top-96 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-20 md:px-6 lg:px-8 lg:flex-row">
        {/* Left */}
        <aside className="order-2 w-full space-y-6 text-sm text-zinc-300 lg:order-1 lg:w-64 lg:pt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-200 transition hover:text-cyan-300"
          >
            ← Nazad na blog
          </Link>

          {mainCategory && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Kategorija</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {mainCategory.name}
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs text-slate-400">
            <p className="font-medium text-slate-300">Objavljeno</p>
            <time className="block text-sm text-slate-200">
              {new Date(post.date).toLocaleDateString("hr-HR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </time>
          </div>

          <div className="hidden border-t border-slate-400 pt-6 text-xs text-slate-400 lg:block">
            <p className="mb-2 font-medium text-slate-300">O čemu je ovaj tekst?</p>
            <p className="text-xs leading-relaxed text-slate-100">
              {truncate(stripHtml(post.excerpt || ""), 200) ||
                "Detaljnije objašnjenje jedne konkretne situacije iz prakse."}
            </p>
          </div>
        </aside>

        {/* Right */}
        <article className="order-1 w-full lg:order-2 lg:flex-1">
          {allImages.length > 0 && <BlogGallery images={allImages} title={post.title} />}

          <header className="mb-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Blog objava
            </div>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl md:text-5xl my-6">
              {post.title}
            </h1>

            <p className="max-w-2xl text-sm text-slate-300">
              {truncate(stripHtml(post.excerpt || ""), 220) ||
                "Zabeleška iz prakse – konkretan problem, konkretno rešenje i gomila sitnih detalja koji prave razliku u produkciji."}
            </p>
          </header>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-zinc-100 prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:text-cyan-100 prose-strong:text-slate-50 prose-img:rounded-2xl prose-figcaption:text-xs prose-figcaption:text-slate-400">
            <div dangerouslySetInnerHTML={{ __html: cleanedContent }} />
          </div>

          <div className="flex items-center justify-center">
            <BackButton />
          </div>
        </article>
      </div>
    </main>
  );
}