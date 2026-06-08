"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { MdErrorOutline, MdOutlineMarkEmailRead } from "react-icons/md";
import { TbTruckReturn } from "react-icons/tb";
import type {
  RequestLinkResponse,
  SubmitWithdrawalResponse,
  VerifyTokenResponse,
  WithdrawalItem,
  WithdrawalScope,
  WithdrawalVerifiedOrder,
} from "@/types/contract-withdrawal";

const GENERIC_REQUEST_LINK_MESSAGE =
  "Ako se podaci podudaraju, poslat ćemo sigurni link na e-mail adresu korištenu pri kupnji.";

const INTRO_COPY =
  "Ako želite odustati od online kupnje u zakonskom roku, ispunite obrazac u nastavku. Zahtjev ćemo evidentirati i poslati potvrdu na e-mail adresu korištenu pri kupnji.";

type VerifyState = "idle" | "loading" | "success" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getResponseError(data: unknown, fallback: string): string {
  if (isRecord(data) && typeof data.error === "string") {
    return data.error;
  }

  if (isRecord(data) && typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

function isSuccessVerifyResponse(
  data: VerifyTokenResponse | null,
): data is Extract<VerifyTokenResponse, { ok: true }> {
  return data?.ok === true;
}

function isSuccessSubmitResponse(
  data: SubmitWithdrawalResponse | null,
): data is Extract<SubmitWithdrawalResponse, { ok: true }> {
  return data?.ok === true;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("hr-HR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-400/50 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
      {status}
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-zinc-950/40 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.35)]">
        <TbTruckReturn className="h-4 w-4" />
        Podrška kupcima
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
        Odustanak od ugovora
      </h1>

      <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
        {INTRO_COPY}
      </p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-cyan-500/40 bg-zinc-900/70 p-8 text-center shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-xl">
      <span className="mx-auto block h-7 w-7 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
      <p className="mt-4 text-sm font-semibold text-zinc-200">
        Učitavanje podataka o narudžbi...
      </p>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-red-500/50 bg-red-950/30 p-5 text-sm text-red-100 shadow-[0_0_35px_rgba(127,29,29,0.3)]">
      <div className="flex items-start gap-3">
        <MdErrorOutline className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
        <div>
          <p className="font-semibold">Nije moguće otvoriti sigurni link.</p>
          <p className="mt-1 text-red-100/90">{message}</p>
        </div>
      </div>
    </div>
  );
}

function OrderItems({
  items,
  selectedItemIds,
  selectionEnabled,
  onToggle,
}: {
  items: WithdrawalItem[];
  selectedItemIds: number[];
  selectionEnabled: boolean;
  onToggle: (itemId: number) => void;
}) {
  return (
    <div className="divide-y divide-zinc-800/80">
      {items.map((item) => (
        <label
          key={item.item_id}
          className={`flex items-start gap-3 py-4 ${
            selectionEnabled ? "cursor-pointer" : ""
          }`}
        >
          {selectionEnabled && (
            <input
              type="checkbox"
              checked={selectedItemIds.includes(item.item_id)}
              onChange={() => onToggle(item.item_id)}
              className="mt-1 h-4 w-4 shrink-0"
            />
          )}

          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-100">{item.name}</p>
            <p className="mt-1 text-xs text-zinc-400">
              Količina:{" "}
              <span className="font-medium text-zinc-200">{item.quantity}</span>
            </p>
          </div>
        </label>
      ))}
    </div>
  );
}

function SuccessView({ response }: { response: Extract<SubmitWithdrawalResponse, { ok: true }> }) {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-emerald-400/50 bg-emerald-950/20 p-6 shadow-[0_0_45px_rgba(16,185,129,0.22)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <HiCheckCircle className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
        <div>
          <h2 className="text-xl font-semibold text-emerald-100">
            Zahtjev za odustanak je zaprimljen.
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50/85">
            Potvrda prijema zahtjeva poslana je na e-mail adresu korištenu pri
            kupnji.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <DetailItem label="Broj zahtjeva" value={response.request_id} />
        <DetailItem label="Datum slanja" value={response.submitted_at} />
        <DetailItem label="E-mail" value={response.customer_email_masked} />
      </div>
    </div>
  );
}

function AlreadyRequested({ order }: { order: WithdrawalVerifiedOrder }) {
  return (
    <div className="mt-6 rounded-3xl border border-emerald-400/40 bg-emerald-950/20 p-5 text-sm text-emerald-50 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
      <div className="flex items-start gap-3">
        <HiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        <div>
          <p className="font-semibold">
            Za ovu narudžbu je zahtjev za odustanak već zaprimljen.
          </p>
          {order.withdrawal_request_id && (
            <p className="mt-1 text-emerald-50/80">
              Broj zahtjeva:{" "}
              <span className="font-semibold">{order.withdrawal_request_id}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WithdrawalClient() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => searchParams.get("t")?.trim() ?? "",
    [searchParams],
  );

  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [order, setOrder] = useState<WithdrawalVerifiedOrder | null>(null);

  const [scope, setScope] = useState<WithdrawalScope>("order");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [comment, setComment] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResponse, setSubmitResponse] = useState<
    Extract<SubmitWithdrawalResponse, { ok: true }> | null
  >(null);

  const [fallbackOrderNumber, setFallbackOrderNumber] = useState("");
  const [fallbackEmail, setFallbackEmail] = useState("");
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [fallbackSuccess, setFallbackSuccess] = useState(false);

  useEffect(() => {
    setSubmitResponse(null);
    setSubmitError(null);
    setConfirmed(false);
    setComment("");
    setScope("order");
    setSelectedItemIds([]);

    if (!token) {
      setVerifyState("idle");
      setVerifyError(null);
      setOrder(null);
      return;
    }

    let cancelled = false;

    async function verifyToken() {
      setVerifyState("loading");
      setVerifyError(null);
      setOrder(null);

      try {
        const res = await fetch("/api/contract-withdrawal/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json().catch(() => null)) as
          | VerifyTokenResponse
          | null;

        if (cancelled) return;

        if (res.ok && isSuccessVerifyResponse(data)) {
          setOrder(data.order);
          setVerifyState("success");
          return;
        }

        console.warn("Contract withdrawal token verification failed", data);
        setVerifyError(
          "Sigurni link nije valjan ili je istekao. Zatražite novi sigurni link putem obrasca.",
        );
        setVerifyState("error");
      } catch {
        if (cancelled) return;
        setVerifyError(
          "Sigurni link nije valjan ili je istekao. Zatražite novi sigurni link putem obrasca.",
        );
        setVerifyState("error");
      }
    }

    void verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleItem = (itemId: number) => {
    setSelectedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  };

  const handleFallbackSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFallbackError(null);

    const orderNumber = fallbackOrderNumber.trim();
    const email = fallbackEmail.trim();

    if (!orderNumber || !email || !email.includes("@")) {
      setFallbackError("Unesite broj narudžbe i ispravnu e-mail adresu.");
      return;
    }

    setFallbackLoading(true);

    try {
      const res = await fetch("/api/contract-withdrawal/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber, email }),
      });
      const data = (await res.json().catch(() => null)) as
        | RequestLinkResponse
        | null;

      if (!res.ok) {
        setFallbackError(
          getResponseError(data, "Nije moguće poslati zahtjev. Pokušajte ponovno."),
        );
        return;
      }

      setFallbackSuccess(true);
    } catch {
      setFallbackError("Nije moguće poslati zahtjev. Pokušajte ponovno.");
    } finally {
      setFallbackLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !order) return;

    setSubmitError(null);

    if (scope === "items" && selectedItemIds.length === 0) {
      setSubmitError("Odaberite barem jednu stavku narudžbe.");
      return;
    }

    if (!confirmed) {
      setSubmitError("Potvrdite da želite odustati od ugovora.");
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await fetch("/api/contract-withdrawal/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          scope,
          item_ids: scope === "items" ? selectedItemIds : [],
          comment,
          confirmed,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | SubmitWithdrawalResponse
        | null;

      if (res.ok && isSuccessSubmitResponse(data)) {
        setSubmitResponse(data);
        return;
      }

      setSubmitError(
        getResponseError(data, "Nije moguće poslati zahtjev. Pokušajte ponovno."),
      );
    } catch {
      setSubmitError("Nije moguće poslati zahtjev. Pokušajte ponovno.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderFallbackForm = () => (
    <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-cyan-500/40 bg-zinc-900/70 p-5 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-7">
      <div className="flex items-start gap-3">
        <MdOutlineMarkEmailRead className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">
            Zatražite sigurni link
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Unesite broj narudžbe i e-mail korišten pri kupnji. Ako se podaci
            podudaraju, poslat ćemo sigurni link na tu adresu.
          </p>
        </div>
      </div>

      {fallbackSuccess ? (
        <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-100">
          {GENERIC_REQUEST_LINK_MESSAGE}
        </div>
      ) : (
        <form onSubmit={handleFallbackSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="block text-xs font-medium text-zinc-300">
                Broj narudžbe
              </span>
              <input
                value={fallbackOrderNumber}
                onChange={(event) => setFallbackOrderNumber(event.target.value)}
                className="w-full rounded-xl border border-[#adb5bd] bg-zinc-950/60 px-3 py-2 text-zinc-100 shadow-sm shadow-[#adb5bd]/30 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                placeholder="Npr. 12345"
                required
              />
            </label>

            <label className="space-y-1.5">
              <span className="block text-xs font-medium text-zinc-300">
                E-mail korišten pri kupnji
              </span>
              <input
                type="email"
                value={fallbackEmail}
                onChange={(event) => setFallbackEmail(event.target.value)}
                className="w-full rounded-xl border border-[#adb5bd] bg-zinc-950/60 px-3 py-2 text-zinc-100 shadow-sm shadow-[#adb5bd]/30 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                placeholder="kupac@example.com"
                required
              />
            </label>
          </div>

          {fallbackError && (
            <p className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-100">
              {fallbackError}
            </p>
          )}

          <button
            type="submit"
            disabled={fallbackLoading}
            className="inline-flex w-full items-center justify-center rounded-full border border-cyan-300 bg-cyan-500/90 px-5 py-3 text-sm font-semibold text-cyan-950 shadow-[0_0_28px_rgba(34,211,238,0.45)] transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {fallbackLoading ? "Šaljem zahtjev..." : "Pošalji sigurni link"}
          </button>
        </form>
      )}
    </div>
  );

  const renderTokenForm = () => {
    if (!order) return null;

    if (submitResponse) {
      return <SuccessView response={submitResponse} />;
    }

    const selectedMode = scope === "items";

    return (
      <form
        onSubmit={handleWithdrawalSubmit}
        className="mx-auto mt-10 max-w-5xl space-y-6"
      >
        <div className="rounded-3xl border border-cyan-500/40 bg-zinc-900/70 p-5 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                Podaci o narudžbi
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
                Narudžba #{order.order_number}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Kreirano: {formatDate(order.created_at)}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <DetailItem label="Broj narudžbe" value={order.order_number} />
            <DetailItem label="E-mail" value={order.customer_email_masked} />
            <DetailItem
              label="Zakonski rok"
              value={`${order.window_days} dana`}
            />
          </div>

          {order.withdrawal_requested ? (
            <AlreadyRequested order={order} />
          ) : (
            <>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-cyan-300">
                  Stavke narudžbe
                </h3>
                <OrderItems
                  items={order.items}
                  selectedItemIds={selectedItemIds}
                  selectionEnabled={selectedMode}
                  onToggle={toggleItem}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-cyan-500/30 bg-zinc-950/40 p-4 text-sm text-zinc-100 transition-colors hover:border-cyan-400/60">
                  <input
                    type="radio"
                    name="withdrawal_scope"
                    checked={scope === "order"}
                    onChange={() => setScope("order")}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="font-semibold">
                    Odustajem od cijele narudžbe
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-cyan-500/30 bg-zinc-950/40 p-4 text-sm text-zinc-100 transition-colors hover:border-cyan-400/60">
                  <input
                    type="radio"
                    name="withdrawal_scope"
                    checked={scope === "items"}
                    onChange={() => setScope("items")}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="font-semibold">
                    Odustajem od odabranih stavki
                  </span>
                </label>
              </div>

              <label className="mt-6 block space-y-1.5">
                <span className="block text-sm font-semibold text-zinc-200">
                  Komentar / napomena (opcionalno)
                </span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-[#adb5bd] bg-zinc-950/60 px-3 py-2 text-zinc-100 shadow-sm shadow-[#adb5bd]/30 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="Upišite dodatnu napomenu ako je potrebno."
                />
              </label>

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-50">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <span>
                  Potvrđujem da želim odustati od ugovora za navedenu narudžbu
                  ili odabrane stavke.
                </span>
              </label>

              {submitError && (
                <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-cyan-300 bg-cyan-500/90 px-5 py-3 text-sm font-semibold text-cyan-950 shadow-[0_0_28px_rgba(34,211,238,0.45)] transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitLoading
                  ? "Šaljem zahtjev..."
                  : "Potvrđujem odustanak"}
              </button>
            </>
          )}
        </div>
      </form>
    );
  };

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader />

        {!token && renderFallbackForm()}

        {token && verifyState === "loading" && <LoadingCard />}

        {token && verifyState === "error" && (
          <>
            <ErrorPanel
              message={
                verifyError ??
                "Pokušajte zatražiti novi sigurni link putem obrasca."
              }
            />
            {renderFallbackForm()}
          </>
        )}

        {token && verifyState === "success" && renderTokenForm()}
      </div>
    </section>
  );
}
