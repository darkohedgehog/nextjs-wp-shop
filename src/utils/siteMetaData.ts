export const siteMetaData = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://zivic-elektro.shop").replace(/\/$/, ""),
  title: "Živić Elektro materijal",
  description: "Prodaja elektro materijala i opreme.",
  brand: "Živić Elektro",
  locale: "hr_HR",

  // Default OG image (fallback)
  defaultOg: "/og/home.jpeg",

  // “Section banners”
  banners: {
    home: "/og/home.jpeg",
    about: "/og/about.jpeg",
    contact: "/og/contact.jpeg",
    blog: "/og/blog.jpeg",
    categories: "/og/categories.jpeg",
    products: "/og/products.jpeg",
  },

  // Statičke strane (title/desc + banner)
  pages: {
    home: {
      title: "Živić Elektro | Elektro materijal",
      description: "Kupujte elektro materijal brzo i sigurno. Dostava, povrat, podrška.",
      banner: "/og/home.jpeg",
      path: "/",
    },
    about: {
      title: "O nama | Živić Elektro",
      description: "Saznajte više o našem timu i ponudi elektro materijala.",
      banner: "/og/about.jpeg",
      path: "/about",
    },
    contact: {
      title: "Kontakt | Živić Elektro",
      description: "Kontaktirajte nas za ponude, dostupnost i podršku.",
      banner: "/og/contact.jpeg",
      path: "/contact",
    },
    blog: {
      title: "Blog | Živić Elektro",
      description: "Saveti, vodiči i novosti iz sveta elektro instalacija i opreme.",
      banner: "/og/blog.jpeg",
      path: "/blog",
    },
    categories: {
      title: "Kategorije | Živić Elektro",
      description: "Pregled kategorija i podkategorija proizvoda.",
      banner: "/og/categories.jpeg",
      path: "/categories",
    },
    products: {
      title: "Proizvodi | Živić Elektro",
      description: "Pregled proizvoda — pronađite ono što vam treba brzo.",
      banner: "/og/products.jpeg",
      path: "/products",
    },
  },
} as const;