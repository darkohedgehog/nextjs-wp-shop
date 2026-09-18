import type { Metadata } from "next";
import Link from "next/link";
import { getPriceLists, getRetailPriceLists } from "@/lib/price-lists-server";
import { buildMetadata } from "@/utils/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Cjenici web trgovine i maloprodaje",
  description: "Preuzmite odvojene cjenike web trgovine i maloprodaje Živić Elektro.",
  path: "/price-list",
});

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  dateStyle: "long", timeStyle: "short", timeZone: "Europe/Zagreb",
});
const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" });

export default async function PriceListPage() {
  const [result, retail] = await Promise.all([getPriceLists(), getRetailPriceLists()]);
  const manifest = result.status === "ready" ? result.manifest : null;
  const [latest, ...archive] = manifest?.publications ?? [];
  const isOlder = latest && dayFormatter.format(new Date(latest.publishedAt)) !== dayFormatter.format(new Date());

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-32 sm:px-6" aria-labelledby="price-list-title">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-300">Živić Elektro</p>
      <h1 id="price-list-title" className="text-3xl font-semibold text-zinc-100 sm:text-4xl">Cjenici</h1>
      <p className="mt-4 max-w-2xl text-zinc-300">Cijene i asortiman web trgovine razlikuju se od maloprodaje. Odaberite cjenik odgovarajućeg prodajnog mjesta.</p>
      <h2 className="mt-10 text-2xl font-semibold text-zinc-100">Web trgovina</h2>
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
      <section className="mt-12 border-t border-zinc-700 pt-10" aria-labelledby="retail-title">
        <h2 id="retail-title" className="text-2xl font-semibold text-zinc-100">Maloprodaja</h2>
        <p className="mt-3 text-zinc-300">Cjenici fizičke prodavaonice. Ažuriraju se ručno nakon promjene cijena.</p>
        {retail.status === "unavailable" ? (
          <p className="mt-6 text-zinc-300" role="status">Maloprodajni cjenici trenutačno nisu dostupni. Pokušajte ponovno kasnije ili <Link href="/contact" className="text-cyan-300 underline">nas kontaktirajte</Link>.</p>
        ) : retail.manifest.files.length === 0 ? (
          <p className="mt-6 text-zinc-300" role="status">Maloprodajni cjenici još nisu objavljeni.</p>
        ) : (
          <>
            <p className="mt-4 text-zinc-300">{retail.manifest.store.name}{retail.manifest.store.address && ` · ${retail.manifest.store.address}`}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {retail.manifest.files.map((file) => (
                <article key={file.kind} className="rounded-3xl border border-zinc-600 bg-zinc-900/80 p-6">
                  <h3 className="text-xl font-semibold text-zinc-100">{file.kind === "current" ? "Aktualni cjenik s usporedbom cijena" : "Cijene na referentni datum"}</h3>
                  <p className="mt-3 text-zinc-300">{file.kind === "current" ? "Datum cjenika" : "Referentni datum"}: <time dateTime={file.date}>{new Intl.DateTimeFormat("hr-HR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(file.date))}</time></p>
                  <p className="mt-2 text-sm text-zinc-400">Objavljeno: <time dateTime={file.publishedAt}>{dateFormatter.format(new Date(file.publishedAt))}</time></p>
                  <a href={file.url} className="mt-6 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Preuzmi {file.kind === "current" ? "cjenik" : "referentne cijene"} ({file.format.toUpperCase()})</a>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
