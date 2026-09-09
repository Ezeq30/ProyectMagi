"use client";

import { useMemo, useState } from "react";
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
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
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
        !payCash && alias ? `Alias usado: ${alias}` : null,
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

  async function openAppOnly() {
    if (alias) {
      try {
        await navigator.clipboard.writeText(alias);
        setCopied("alias");
      } catch {
        /* ignore */
      }
    }
    // Abrir en pestaña nueva para no “perder” esta pantalla con el titular/alias
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
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
        Pagá tu pedido
      </h1>
      <p className="mt-2 text-ink-soft">
        Pedido <strong className="text-ink">{orderNumber}</strong>
      </p>
      <div className="mt-4 space-y-1 rounded-lg border border-line bg-white px-4 py-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-ink-soft">Productos</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between gap-3">
            <span className="text-ink-soft">
              {payCash ? "Descuento (efectivo 5%)" : "Descuento"}
            </span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-ink-soft">{shippingLabel ?? "Envío"}</span>
          <span>
            {shippingCost > 0
              ? formatPrice(shippingCost)
              : shippingLabel?.toLowerCase().includes("coordinar")
                ? "Sin cargo"
                : "Gratis"}
          </span>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-2 text-base font-semibold">
          <span>Total a pagar</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {!paid ? (
        <div className="mt-8 space-y-5 rounded-xl border border-line bg-white p-5">
          {payCash ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-bg-deep/60 p-4">
                <p className="text-xs uppercase tracking-wide text-ink-soft">Forma de pago</p>
                <p className="mt-1 text-lg font-semibold text-ink">Efectivo · 5% OFF</p>
                <p className="mt-2 text-sm text-ink-soft">
                  El descuento ya está aplicado en el total. Coordiná con Magali por WhatsApp
                  la entrega/retiro y el pago en efectivo.
                </p>
              </div>
              <a
                className="magi-btn w-full text-center"
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
          ) : (
            <>
              <div className="rounded-lg border border-line bg-bg-deep/60 p-4">
                <p className="text-xs uppercase tracking-wide text-ink-soft">Pagás a</p>
                <p className="mt-1 text-lg font-semibold text-ink">{STORE_DISPLAY_NAME}</p>
                {holder ? (
                  <p className="mt-1 text-sm text-ink">
                    Titular de la cuenta: <strong>{holder}</strong>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-ink-soft">
                    (Podés cargar el nombre del titular en Admin → Config)
                  </p>
                )}
              </div>

              {mpReady && (
                <div className="space-y-3">
                  <p className="text-sm text-ink-soft">
                    Opción recomendada: Mercado Pago abre con el monto ya cargado.
                  </p>
                  <button
                    type="button"
                    className="magi-btn w-full"
                    disabled={paying}
                    onClick={payWithMercadoPago}
                  >
                    {paying
                      ? "Abriendo Mercado Pago…"
                      : `Pagar ${formatPrice(total)} con Mercado Pago`}
                  </button>
                  {payError && <p className="text-sm text-red-700">{payError}</p>}
                </div>
              )}

              {hasTransfer && (
                <div className={`space-y-4 ${mpReady ? "border-t border-line pt-4" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {mpReady ? "O transferí por alias / CBU" : "Transferí por alias / CBU"}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      Copiá el alias, abrí Mercado Pago y transferí exactamente{" "}
                      {formatPrice(total)}.
                    </p>
                  </div>

                  {holder && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-soft">Titular</p>
                      <p className="mt-1 font-medium">{holder}</p>
                    </div>
                  )}
                  {alias && (
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-soft">Alias</p>
                        <p className="mt-1 break-all text-lg font-semibold">{alias}</p>
                      </div>
                      <button
                        type="button"
                        className="magi-btn magi-btn-outline shrink-0 px-3 py-2 text-xs"
                        onClick={() => copy(alias, "alias")}
                      >
                        {copied === "alias" ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                  )}
                  {cbu && (
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-soft">CBU / CVU</p>
                        <p className="mt-1 break-all font-semibold tracking-wide">{cbu}</p>
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

              {!mpReady && !hasTransfer && (
                <p className="text-sm text-red-700">
                  El pago aún no está configurado. Escribile a Magali por WhatsApp.
                </p>
              )}

              <button
                type="button"
                className="magi-btn magi-btn-outline w-full"
                onClick={() => setPaid(true)}
              >
                Ya pagué — enviar comprobante
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-4 rounded-xl border border-line bg-white p-5">
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
