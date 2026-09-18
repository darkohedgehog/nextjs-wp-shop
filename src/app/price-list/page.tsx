import type { Metadata } from "next";
import Link from "next/link";
import { getPriceLists } from "@/lib/price-lists-server";
import { buildMetadata } from "@/utils/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Cjenik web trgovine",
  description: "Preuzmite cjenik web trgovine Živić Elektro i pregledajte prethodne objave.",
  path: "/price-list",
});

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  dateStyle: "long", timeStyle: "short", timeZone: "Europe/Zagreb",
});
const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" });

export default async function PriceListPage() {
  const result = await getPriceLists();
  const manifest = result.status === "ready" ? result.manifest : null;
  const [latest, ...archive] = manifest?.publications ?? [];
  const isOlder = latest && dayFormatter.format(new Date(latest.publishedAt)) !== dayFormatter.format(new Date());

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-32 sm:px-6" aria-labelledby="price-list-title">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-300">Živić Elektro · Webshop</p>
      <h1 id="price-list-title" className="text-3xl font-semibold text-zinc-100 sm:text-4xl">Cjenik web trgovine</h1>
      <p className="mt-4 max-w-2xl text-zinc-300">
        Preuzmite cijene proizvoda web trgovine u CSV formatu. Cijene su izražene u eurima s uključenim PDV-om.
      </p>
      <div className="mt-8 rounded-3xl border border-zinc-600 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
        {result.status === "unavailable" ? (
          <div role="status">
            <h2 className="text-xl font-semibold text-zinc-100">Cjenik trenutačno nije dostupan</h2>
            <p className="mt-3 text-zinc-300">Pokušajte ponovno kasnije ili nam se obratite za informacije o cijenama.</p>
            <Link className="mt-4 inline-block text-cyan-300 underline underline-offset-4" href="/contact">Kontaktirajte nas</Link>
          </div>
        ) : !latest ? (
          <div role="status">
            <h2 className="text-xl font-semibold text-zinc-100">Cjenik još nije objavljen</h2>
            <p className="mt-3 text-zinc-300">Nakon objave ovdje ćete moći preuzeti cjenik web trgovine.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-zinc-100">Posljednja objava</h2>
            <p className="mt-2 text-zinc-300">{manifest?.store.name} · {manifest?.store.address}</p>
            <p className="mt-3 text-zinc-300">Objavljeno: <time dateTime={latest.publishedAt}>{dateFormatter.format(new Date(latest.publishedAt))}</time></p>
            <p className="mt-1 text-sm text-zinc-400">Broj artikala: {latest.productCount}</p>
            {isOlder && <p className="mt-4 text-amber-200" role="status">Posljednja dostupna objava nije od današnjeg datuma. Provjerite datum cjenika prije korištenja.</p>}
            <a href={latest.url} className="mt-6 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              Preuzmi cjenik (CSV)
            </a>
          </>
        )}
      </div>
      {archive.length > 0 && (
        <section className="mt-10" aria-labelledby="archive-title">
          <h2 id="archive-title" className="text-2xl font-semibold text-zinc-100">Prethodni cjenici</h2>
          <ul className="mt-4 divide-y divide-zinc-700 rounded-2xl border border-zinc-700 bg-zinc-900/70 px-5">
            {archive.map((publication) => (
              <li key={publication.id} className="py-4">
                <a href={publication.url} className="text-cyan-300 underline underline-offset-4">
                  Cjenik — <time dateTime={publication.publishedAt}>{dateFormatter.format(new Date(publication.publishedAt))}</time> (CSV)
                </a>
                <p className="mt-1 text-sm text-zinc-400">{publication.productCount} artikala</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
