"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { MERCADOPAGO_WEB_URL, STORE_DISPLAY_NAME } from "@/lib/payment";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  orderNumber: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  shippingLabel?: string;
  paymentMethod?: "mercadopago" | "cash";
  alias: string;
  cbu: string;
  holder: string;
  whatsapp: string;
  mpReady: boolean;
  /** Si true, intenta abrir Checkout Pro al montar */
  autoStartMp?: boolean;
};

export function PaymentTransferPanel({
  orderNumber,
  total,
  subtotal,
  shippingCost,
  discount,
  shippingLabel,
  paymentMethod = "mercadopago",
  alias,
  cbu,
  holder,
  whatsapp,
  mpReady,
  autoStartMp = false,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const autoStarted = useRef(false);
  const hasTransfer = Boolean(alias || cbu);
  const payCash = paymentMethod === "cash";

  const message = useMemo(
    () =>
      [
        payCash
          ? `Hola Magali! Quiero confirmar mi pedido en ${STORE_DISPLAY_NAME} pagando en efectivo.`
          : `Hola Magali! Ya pagué mi compra en ${STORE_DISPLAY_NAME}.`,
        `Pedido: ${orderNumber}`,
        `Total: ${formatPrice(total)}`,
        payCash ? "Forma de pago: efectivo (con 5% OFF)." : null,
        !payCash && alias ? `Alias: ${alias}` : null,
        holder ? `Titular: ${holder}` : null,
        payCash
          ? "Coordinemos entrega/retiro y el pago en efectivo."
          : "Te adjunto / envío el comprobante.",
      ]
        .filter(Boolean)
        .join("\n"),
    [alias, holder, orderNumber, payCash, total],
  );

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  async function payWithMercadoPago() {
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch("/api/checkout/mp-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        setPayError(
          data.error ||
            "No se pudo preparar el pago. Podés transferir por alias más abajo.",
        );
        return;
      }
      window.location.href = data.init_point;
    } catch {
      setPayError("Error de red al abrir Mercado Pago.");
    } finally {
      setPaying(false);
    }
  }

  useEffect(() => {
    if (!autoStartMp || payCash || !mpReady || autoStarted.current) return;
    autoStarted.current = true;
    void payWithMercadoPago();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount
  }, [autoStartMp, mpReady, payCash]);

  async function openAppOnly() {
    if (alias) {
      try {
        await navigator.clipboard.writeText(alias);
        setCopied("alias");
      } catch {
        /* ignore */
      }
    }
    window.open(MERCADOPAGO_WEB_URL, "_blank", "noopener,noreferrer");
  }

  async function shareReceipt() {
    setSharing(true);
    setShareNote("");
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprobante ${orderNumber}`,
          text: message,
        });
        setShareNote("Compartido. Si no se abrió WhatsApp, elegí WhatsApp en el menú.");
        return;
      }
      window.open(whatsappUrl(message, whatsapp), "_blank", "noopener,noreferrer");
      setShareNote(
        file
          ? "Se abrió el chat de Magali: adjuntá la foto del comprobante ahí."
          : "Se abrió el chat: pegá o adjuntá el comprobante.",
      );
    } catch {
      window.open(whatsappUrl(message, whatsapp), "_blank", "noopener,noreferrer");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {payCash ? "Pago en efectivo" : "Transferencia · Mercado Pago"}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
        {payCash ? "Pagá tu pedido" : "Transferí tu pago"}
      </h1>
      <p className="mt-2 text-ink-soft">
        Pedido <strong className="text-ink">{orderNumber}</strong>
      </p>

      {!payCash && (
        <div className="mt-6 border border-line bg-card p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Pagás a
          </p>
          <p className="mt-2 text-xl font-semibold text-ink">{STORE_DISPLAY_NAME}</p>
          {holder ? (
            <p className="mt-1 text-sm text-ink-soft">
              Titular: <strong className="text-ink">{holder}</strong>
            </p>
          ) : null}

          {alias ? (
            <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Alias
                </p>
                <p className="mt-1 break-all text-lg font-semibold tracking-wide text-ink sm:text-xl">
                  {alias}
                </p>
              </div>
              <button
                type="button"
                className="magi-btn magi-btn-outline shrink-0 px-3 py-2 text-xs"
                onClick={() => copy(alias, "alias")}
              >
                {copied === "alias" ? "Copiado" : "Copiar"}
              </button>
            </div>
          ) : null}

          <div className="mt-5 border-t border-line pt-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Monto
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink sm:text-5xl">
              {formatPrice(total)}
            </p>
            <p className="mt-2 text-xs text-ink-soft">
              Productos {formatPrice(subtotal)}
              {discount > 0 ? ` · Desc. -${formatPrice(discount)}` : ""}
              {" · "}
              {shippingLabel ?? "Envío"}{" "}
              {shippingCost > 0
                ? formatPrice(shippingCost)
                : shippingLabel?.toLowerCase().includes("coordinar")
                  ? "a coordinar"
                  : "gratis"}
            </p>
          </div>

          {mpReady && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="magi-btn w-full justify-center"
                disabled={paying}
                onClick={payWithMercadoPago}
              >
                {paying
                  ? "Abriendo Mercado Pago…"
                  : `Pagar ${formatPrice(total)}`}
              </button>
              <p className="text-center text-xs text-ink-soft">
                Se abre Mercado Pago con el monto ya cargado. Solo elegís cómo pagar y
                confirmás.
              </p>
              {payError && <p className="text-sm text-red-700">{payError}</p>}
            </div>
          )}

          {hasTransfer && (
            <div className="mt-5 border-t border-line pt-4">
              <button
                type="button"
                className="text-sm text-ink-soft underline-offset-4 hover:underline"
                onClick={() => setManualOpen((v) => !v)}
              >
                {manualOpen
                  ? "Ocultar transferencia manual"
                  : "O transferí manual al alias"}
              </button>
              {manualOpen && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-ink-soft">
                    Copiá el alias, abrí Mercado Pago y transferí exactamente{" "}
                    {formatPrice(total)}.
                  </p>
                  {cbu && (
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-ink-soft">
                          CBU / CVU
                        </p>
                        <p className="mt-1 break-all font-semibold">{cbu}</p>
                      </div>
                      <button
                        type="button"
                        className="magi-btn magi-btn-outline shrink-0 px-3 py-2 text-xs"
                        onClick={() => copy(cbu, "cbu")}
                      >
                        {copied === "cbu" ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="magi-btn magi-btn-outline w-full"
                    onClick={openAppOnly}
                  >
                    Abrir Mercado Pago (copia el alias)
                  </button>
                </div>
              )}
            </div>
          )}

          {!mpReady && !hasTransfer && (
            <p className="mt-4 text-sm text-red-700">
              El pago aún no está configurado. Escribile a Magali por WhatsApp.
            </p>
          )}

          {!mpReady && hasTransfer && (
            <button
              type="button"
              className="magi-btn mt-6 w-full"
              onClick={openAppOnly}
            >
              Abrir Mercado Pago y transferir {formatPrice(total)}
            </button>
          )}

          <button
            type="button"
            className="magi-btn magi-btn-outline mt-4 w-full"
            onClick={() => setPaid(true)}
          >
            Ya pagué — enviar comprobante
          </button>
        </div>
      )}

      {payCash && !paid && (
        <div className="mt-6 space-y-4 border border-line bg-card p-5">
          <div className="border border-line bg-bg-deep/60 p-4">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Forma de pago</p>
            <p className="mt-1 text-lg font-semibold text-ink">Efectivo · 5% OFF</p>
            <p className="mt-2 text-sm text-ink-soft">
              Total con descuento: <strong>{formatPrice(total)}</strong>. Coordiná con
              Magali por WhatsApp.
            </p>
          </div>
          <a
            className="magi-btn w-full justify-center text-center"
            href={whatsappUrl(message, whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Coordinar pago en efectivo por WhatsApp
          </a>
          <button
            type="button"
            className="magi-btn magi-btn-outline w-full"
            onClick={() => setPaid(true)}
          >
            Ya coordiné / confirmar pedido
          </button>
        </div>
      )}

      {paid && (
        <div className="mt-6 space-y-4 border border-line bg-card p-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Enviar comprobante
          </h2>
          <p className="text-sm text-ink-soft">
            Mandale el comprobante a Magali por WhatsApp para confirmar el pedido{" "}
            <strong>{orderNumber}</strong>.
          </p>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Foto del comprobante (opcional)</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="magi-input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            className="magi-btn w-full"
            disabled={sharing}
            onClick={shareReceipt}
          >
            {sharing ? "Abriendo…" : "Compartir comprobante por WhatsApp"}
          </button>
          {shareNote && <p className="text-sm text-success">{shareNote}</p>}
          <button
            type="button"
            className="text-sm text-ink-soft underline"
            onClick={() => setPaid(false)}
          >
            Volver a los datos de pago
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/productos" className="text-sm text-accent underline-offset-4 hover:underline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
