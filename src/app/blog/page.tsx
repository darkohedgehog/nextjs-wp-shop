import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

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

// 👇 malo striktniji tip za variables
type GraphQLVariables = Record<
  string,
  string | number | boolean | null | undefined
>;

async function fetchGraphQL<T>(
  query: string,
  variables?: GraphQLVariables,
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

  const json = (await res.json()) as {
    data: T;
    errors?: unknown;
  };

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("GraphQL response sadrži errors");
  }

  return json.data;
}

const GET_ALL_POSTS = `
  query GetAllPosts {
    posts(first: 20, where: { orderby: { field: DATE, order: DESC } }) {
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

export const metadata: Metadata = {
  title: "Blog | Živić elektro materijal",
  description:
    "Tekstovi iz prakse – problemi, rješenja i savjeti iz svijeta elektro materijala, ugradnje proizvoda",
};

export const revalidate = 60;

export default async function BlogPage() {
  let posts: Post[] = [];

  try {
    const data = await fetchGraphQL<{
      posts: { nodes: Post[] } | null;
    }>(GET_ALL_POSTS, undefined, 60);

    posts = data.posts?.nodes ?? [];
  } catch (err) {
    console.error("❌ BlogPage GraphQL error:", err);
    posts = [];
  }

  return (
    <main className="relative min-h-screen text-slate-50">
      {/* Glow background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute inset-x-0 -top-40 h-72 bg-linear-to-b from-cyan-500/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-32 top-48 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-32 top-80 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-24 md:px-6 lg:px-8">
        {/* Hero */}
        <header className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Blog &amp; novosti
            </span>
            <div className="space-y-3">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
                Blog u SaaS fazonu,
                <span className="bg-linear-to-r from-cyan-300 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                  {" "}
                  ali iz realne prakse.
                </span>
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Beležimo izazove prilikom ugradnje, izbora proizvoda, sheme
                proizvoda i sve ono što bi i vama moglo da uštedi sate živaca.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400 md:mt-0 md:text-right">
            <span className="rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1">
              Ugradnja proizvoda
            </span>
            <span className="rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1">
              Sheme &amp; montaža
            </span>
            <span className="rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1">
              Savjeti iz prakse
            </span>
          </div>
        </header>

        {/* Fallback */}
        {posts.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400 flex items-center justify-center">
            Trenutno nema dostupnih blog objava ili je došlo do greške u
            konekciji.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#adb5bd] bg-slate-900/20 p-1 shadow-2xl shadow-black/40 backdrop-blur transition hover:border-cyan-400/60 hover:shadow-cyan-500/20"
              >
                <div className="relative overflow-hidden rounded-2xl bg-slate-900/30">
                  {post.featuredImage?.node?.sourceUrl && (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <Image
                        src={post.featuredImage.node.sourceUrl}
                        alt={post.featuredImage.node.altText || post.title}
                        fill
                        priority
                        className="object-cover rounded-2xl transition duration-500 group-hover:scale-[1.04] mx-auto"
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-70" />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
                    <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-200">
                      {post.categories?.nodes.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300/90"
                        >
                          <span className="inline-block h-1 w-1 rounded-full bg-cyan-400" />
                          {cat.name}
                        </span>
                      ))}
                    </div>
                    <h2 className="line-clamp-2 text-sm font-semibold text-slate-50 sm:text-base">
                      {post.title}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                  <div
                    className="line-clamp-3 text-xs text-zinc-300/80 sm:text-sm"
                    dangerouslySetInnerHTML={{
                      __html: post.excerpt || "",
                    }}
                  />

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <time className="font-medium">
                      {new Date(post.date).toLocaleDateString("hr-HR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </time>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-cyan-300 ring-1 ring-cyan-500/40 transition hover:bg-cyan-500/10 hover:text-cyan-100"
                    >
                      Pročitaj više
                      <span aria-hidden="true" className="text-sm">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}