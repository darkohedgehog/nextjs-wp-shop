// components/blog/BlogIntroSection.tsx
import Link from "next/link";
import Image from "next/image";
import { ShineBorder } from "@/components/ui/shine-border";

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

const WP_GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL;

// generic fetch helper
async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, any>,
  revalidateSeconds = 60
): Promise<T> {
  if (!WP_GRAPHQL_URL) {
    throw new Error("NEXT_PUBLIC_GRAPHQL_URL nije definisan");
  }

  const res = await fetch(WP_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate: revalidateSeconds,
    },
  });

  if (!res.ok) {
    console.error("GraphQL HTTP error:", res.status, await res.text());
    throw new Error(`GraphQL HTTP error: ${res.status}`);
  }

  const json = await res.json();

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("GraphQL response sadrži errors");
  }

  return json.data as T;
}

const GET_LATEST_POSTS = `
  query GetLatestPosts {
    posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        date
        title
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
  }
`;

// ručno formatiranje datuma (deterministic)
function formatDate(dateString: string): string {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}.`;
}

export default async function BlogIntroSection() {
  let posts: Post[] = [];

  try {
    const data = await fetchGraphQL<{
      posts: { nodes: Post[] } | null;
    }>(GET_LATEST_POSTS, undefined, 60);

    posts = data.posts?.nodes ?? [];
  } catch (err) {
    console.error("❌ BlogIntroSection GraphQL error:", err);
    posts = [];
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="relative mx-auto my-16 w-full max-w-6xl px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
            Blog &amp; priče iz prakse
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Šta se zapravo dešava{" "}
            <span className="bg-linear-to-r from-cyan-300 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              iza kulisa projekta
            </span>
            ?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Konkretni problemi, realne situacije sa
            ugradnjom, objašnjeni primjeri instalacije proizvoda...
          </p>
        </div>

        <Link
          href="/blog"
          className="mt-3 inline-flex items-center justify-center rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-100 shadow-sm shadow-cyan-500/20 backdrop-blur transition hover:bg-cyan-500/20 hover:text-white"
        >
          Pogledaj sve objave
          <span aria-hidden="true" className="ml-1 text-sm">
            →
          </span>
        </Link>
      </div>

      {/* Grid – ShineBorder oko svake kartice */}
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="relative group">
            {/* Shine border overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl">
              <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                duration={14}
                borderWidth={2}
              />
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="relative z-10 flex h-full flex-col rounded-2xl bg-slate-900/20 p-4 transition group-hover:bg-slate-900/60"
            >
              {/* Slika */}
              {post.featuredImage?.node?.sourceUrl && (
                <Image
                  width={400}
                  height={320}
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  priority
                  className="mb-3 h-48 w-full rounded-xl object-cover mx-auto"
                />
              )}

              {/* Meta */}
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <span className="uppercase tracking-[0.18em] text-slate-400">
                  {formatDate(post.date)}
                </span>
                <div className="flex flex-wrap gap-1">
                  {post.categories?.nodes.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full bg-cyan-600/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-100"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Naslov */}
              <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100">
                {post.title}
              </h3>

              {/* Excerpt – koristimo div da ne pravimo invalid nested <p> */}
              <div
                className="mt-2 line-clamp-3 text-xs text-zinc-300/90"
                dangerouslySetInnerHTML={{
                  __html: post.excerpt || "",
                }}
              />

              {/* Link dole */}
              <p className="mt-3 pt-1">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 transition group-hover:text-cyan-100">
                  Pročitaj priču
                  <span aria-hidden="true" className="text-sm">
                    →
                  </span>
                </span>
              </p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}