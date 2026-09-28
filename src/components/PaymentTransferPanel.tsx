"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import {
  STORE_DISPLAY_NAME,
  TRANSFER_DISCOUNT_PERCENT,
  type CheckoutPaymentMethod,
} from "@/lib/payment";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  orderNumber: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  shippingLabel?: string;
  paymentMethod?: CheckoutPaymentMethod;
  alias: string;
  cbu: string;
  holder: string;
  whatsapp: string;
  mpReady: boolean;
  /** Si true, intenta abrir Checkout Pro al montar */
  autoStartMp?: boolean;
};

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  large,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  large?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          {label}
        </p>
        <p
          className={`mt-1 break-all font-semibold tracking-wide text-ink ${
            large ? "text-lg sm:text-xl" : "text-base"
          }`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        className="magi-btn magi-btn-outline shrink-0 px-3 py-2 text-xs"
        onClick={onCopy}
      >
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

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
  const autoStarted = useRef(false);
  const hasTransfer = Boolean(alias || cbu);
  const payTransfer = paymentMethod === "transfer";
  const amountText = String(Math.round(total));

  const message = useMemo(
    () =>
      [
        `Hola Magali! Ya pagué mi compra en ${STORE_DISPLAY_NAME}.`,
        `Pedido: ${orderNumber}`,
        `Total: ${formatPrice(total)}`,
        payTransfer
          ? `Pagué por transferencia (${TRANSFER_DISCOUNT_PERCENT}% OFF).`
          : "Pagué con Mercado Pago.",
        "Te adjunto / envío el comprobante.",
      ].join("\n"),
    [orderNumber, payTransfer, total],
  );

  const allTransferData = useMemo(
    () =>
      [
        holder ? `Titular: ${holder}` : null,
        alias ? `Alias: ${alias}` : null,
        cbu ? `CBU/CVU: ${cbu}` : null,
        `Monto: ${formatPrice(total)}`,
        `Pedido: ${orderNumber}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [alias, cbu, holder, orderNumber, total],
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
        setPayError(data.error || "No se pudo preparar el pago con Mercado Pago.");
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
    if (!autoStartMp || payTransfer || !mpReady || autoStarted.current) return;
    autoStarted.current = true;
    void payWithMercadoPago();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount
  }, [autoStartMp, mpReady, payTransfer]);

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

  const breakdown = (
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
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {payTransfer
          ? `Transferencia · ${TRANSFER_DISCOUNT_PERCENT}% OFF`
          : "Mercado Pago"}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
        {payTransfer ? "Transferí tu pago" : "Pagá tu pedido"}
      </h1>
      <p className="mt-2 text-ink-soft">
        Pedido <strong className="text-ink">{orderNumber}</strong>
      </p>

      {!paid && payTransfer && (
        <div className="mt-6 border border-line bg-card p-5 sm:p-6">
          <p className="text-sm text-ink-soft">
            Copiá los datos y transferí desde tu banco o billetera virtual el monto exacto.
          </p>

          {hasTransfer ? (
            <div className="mt-5 space-y-4">
              {holder ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Titular
                  </p>
                  <p className="mt-1 text-base font-semibold text-ink">{holder}</p>
                </div>
              ) : null}
              {alias ? (
                <CopyRow
                  label="Alias"
                  value={alias}
                  large
                  copied={copied === "alias"}
                  onCopy={() => copy(alias, "alias")}
                />
              ) : null}
              {cbu ? (
                <CopyRow
                  label="CBU / CVU"
                  value={cbu}
                  copied={copied === "cbu"}
                  onCopy={() => copy(cbu, "cbu")}
                />
              ) : null}
              <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Monto con {TRANSFER_DISCOUNT_PERCENT}% OFF
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink">
                    {formatPrice(total)}
                  </p>
                </div>
                <button
                  type="button"
                  className="magi-btn magi-btn-outline shrink-0 px-3 py-2 text-xs"
                  onClick={() => copy(amountText, "amount")}
                >
                  {copied === "amount" ? "Copiado" : "Copiar"}
                </button>
              </div>
              {breakdown}

              <button
                type="button"
                className="magi-btn magi-btn-outline w-full justify-center"
                onClick={() => copy(allTransferData, "all")}
              >
                {copied === "all" ? "Datos copiados" : "Copiar todos los datos"}
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-red-700">
              Los datos de transferencia no están cargados. Escribile a Magali por WhatsApp.
            </p>
          )}

          <button
            type="button"
            className="magi-btn mt-6 w-full justify-center"
            onClick={() => setPaid(true)}
          >
            Ya transferí — enviar comprobante
          </button>
        </div>
      )}

      {!paid && !payTransfer && (
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

          <div className="mt-5 border-t border-line pt-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Monto
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink sm:text-5xl">
              {formatPrice(total)}
            </p>
            {breakdown}
          </div>

          {mpReady ? (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="magi-btn w-full justify-center"
                disabled={paying}
                onClick={payWithMercadoPago}
              >
                {paying ? "Abriendo Mercado Pago…" : `Pagar ${formatPrice(total)}`}
              </button>
              <p className="text-center text-xs text-ink-soft">
                Se abre Mercado Pago con el monto ya cargado. Solo elegís cómo pagar y
                confirmás.
              </p>
              {payError && <p className="text-sm text-red-700">{payError}</p>}
            </div>
          ) : (
            <p className="mt-4 text-sm text-red-700">
              El pago online aún no está configurado. Escribile a Magali por WhatsApp.
            </p>
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
