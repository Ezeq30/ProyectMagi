"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  orderNumber: string;
  total: number;
  whatsapp: string;
};

export function ShareReceiptButton({ orderNumber, total, whatsapp }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const message = useMemo(
    () =>
      [
        "Hola Magali! Ya pagué mi compra en Accesorios Tortugas Online.",
        orderNumber ? `Pedido: ${orderNumber}` : null,
        total > 0 ? `Total: ${formatPrice(total)}` : null,
        "Te envío el comprobante.",
      ]
        .filter(Boolean)
        .join("\n"),
    [orderNumber, total],
  );

  async function share() {
    setBusy(true);
    setNote("");
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprobante ${orderNumber}`,
          text: message,
        });
        setNote("Elegí WhatsApp para enviarle el comprobante a Magali.");
        return;
      }
      window.open(whatsappUrl(message, whatsapp), "_blank", "noopener,noreferrer");
      setNote(
        file
          ? "Se abrió el chat: adjuntá ahí la foto del comprobante."
          : "Se abrió el chat de Magali para enviar el comprobante.",
      );
    } catch {
      window.open(whatsappUrl(message, whatsapp), "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-3 text-left">
      <label className="block text-sm">
        <span className="mb-1 block text-center text-xs text-ink-soft sm:text-left">
          Foto del comprobante (opcional)
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="magi-input"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <button type="button" className="magi-btn w-full" disabled={busy} onClick={share}>
        {busy ? "Abriendo…" : "Compartir comprobante por WhatsApp"}
      </button>
      {note && <p className="text-center text-xs text-success">{note}</p>}
    </div>
  );
}
