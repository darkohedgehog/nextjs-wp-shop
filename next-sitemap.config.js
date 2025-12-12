/** @type {import('next-sitemap').IConfig} */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://zivic-elektro.shop";

const CATEGORY_BASE = "/categories";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,

  changefreq: "daily",
  priority: 0.7,

  exclude: [
    "/api/*",
    "/admin/*",
    "/dashboard/*",
    "/account/*",
    "/checkout/*",
    "/cart/*",
    "/order-success*",
    "/lost-password*",
    "/reset-password*",
    "/login*",
    "/register*",
    "/404",
    "/500",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/lost-password",
          "/reset-password",
          "/login",
          "/register",
        ],
      },
    ],
  },

  transform: async (config, path) => {
    const cleanPath = path.replace(/\/$/, "") || "/";
    return {
      loc: cleanPath,
      changefreq: config.changefreq,
      priority: cleanPath === "/" ? 1.0 : config.priority,
      lastmod: new Date().toISOString(),
    };
  },

  additionalPaths: async () => {
    const result = [];

    // Statičke stranice (dodaj/izbaci po potrebi)
    const staticPages = [
      "/",
      "/products",
      "/categories",
      "/blog",
      "/about",
      "/contact",
      "/privacy",
      "/complaint",
    ];

    staticPages.forEach((path) => {
      result.push({
        loc: path,
        changefreq: "monthly",
        priority: path === "/" ? 1.0 : 0.8,
        lastmod: new Date().toISOString(),
      });
    });

    const WP_GRAPHQL =
      process.env.WP_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;

    if (!WP_GRAPHQL) {
      console.warn("[next-sitemap] WP_GRAPHQL_URL not defined");
      return result;
    }

    const gqlFetch = async (query, variables = {}) => {
      try {
        const res = await fetch(WP_GRAPHQL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        });

        if (!res.ok) {
          console.warn("[next-sitemap] WPGraphQL fetch failed:", res.status);
          return null;
        }

        const json = await res.json();
        if (json?.errors?.length) {
          console.warn("[next-sitemap] WPGraphQL errors:", json.errors);
          return null;
        }

        return json?.data ?? null;
      } catch (e) {
        console.warn("[next-sitemap] WPGraphQL fetch exception:", e);
        return null;
      }
    };

    // ==========================================
    // 🧩 KATEGORIJE + PODKATEGORIJE
    // URL format koji ti treba:
    // /categories/parent
    // /categories/parent/child
    // ==========================================
    const CATEGORIES_QUERY = `
      query ProductCategoriesSitemap($first: Int!, $after: String) {
        productCategories(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            slug
            parent {
              node { slug }
            }
          }
        }
      }
    `;

    const categories = [];
    let after = null;
    const first = 100;

    while (true) {
      const data = await gqlFetch(CATEGORIES_QUERY, { first, after });
      const nodes = data?.productCategories?.nodes ?? [];

      nodes.forEach((c) => {
        if (!c?.slug) return;
        categories.push({
          slug: c.slug,
          parentSlug: c?.parent?.node?.slug ?? null,
        });
      });

      const pageInfo = data?.productCategories?.pageInfo;
      if (!pageInfo?.hasNextPage) break;
      after = pageInfo.endCursor;
      if (!after) break;
    }

    // map slug -> node
    const bySlug = new Map(categories.map((c) => [c.slug, c]));

    // pravimo /categories/parent/child (i podržava dublje nivoe ako ikad zatreba)
    const buildCategoryPath = (slug) => {
      const node = bySlug.get(slug);
      if (!node) return `${CATEGORY_BASE}/${slug}`;

      const parts = [node.slug];
      let p = node.parentSlug;

      let guard = 0;
      while (p && guard < 6) {
        const parentNode = bySlug.get(p);
        parts.unshift(parentNode?.slug ?? p);
        p = parentNode?.parentSlug ?? null;
        guard++;
      }

      return `${CATEGORY_BASE}/${parts.join("/")}`;
    };

    // Dodaj sve kategorije i podkategorije u sitemap
    categories.forEach((c) => {
      const path = buildCategoryPath(c.slug);

      result.push({
        loc: path,
        changefreq: "weekly",
        priority: 0.85,
        lastmod: new Date().toISOString(),
      });
    });

    // ==========================================
    // 🛒 PROIZVODI
    // URL: /products/[slug]
    // ==========================================
    const PRODUCTS_QUERY = `
      query ProductsSitemap($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { slug }
        }
      }
    `;

    after = null;

    while (true) {
      const data = await gqlFetch(PRODUCTS_QUERY, { first, after });
      const nodes = data?.products?.nodes ?? [];

      nodes.forEach((p) => {
        if (!p?.slug) return;

        result.push({
          loc: `/products/${p.slug}`,
          changefreq: "weekly",
          priority: 0.7,
          lastmod: new Date().toISOString(),
        });
      });

      const pageInfo = data?.products?.pageInfo;
      if (!pageInfo?.hasNextPage) break;
      after = pageInfo.endCursor;
      if (!after) break;
    }

    // ==========================================
    // 📰 BLOG
    // URL: /blog/[slug]
    // ==========================================
    const POSTS_QUERY = `
      query PostsSitemap($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { slug }
        }
      }
    `;

    after = null;

    while (true) {
      const data = await gqlFetch(POSTS_QUERY, { first, after });
      const nodes = data?.posts?.nodes ?? [];

      nodes.forEach((post) => {
        if (!post?.slug) return;

        result.push({
          loc: `/blog/${post.slug}`,
          changefreq: "monthly",
          priority: 0.6,
          lastmod: new Date().toISOString(),
        });
      });

      const pageInfo = data?.posts?.pageInfo;
      if (!pageInfo?.hasNextPage) break;
      after = pageInfo.endCursor;
      if (!after) break;
    }

    return result;
  },
};