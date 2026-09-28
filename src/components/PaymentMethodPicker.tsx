"use client";

import {
  TICKET_EXPIRATION_DAYS,
  TICKET_METHOD_LABELS,
  TRANSFER_DISCOUNT_PERCENT,
  type CheckoutPaymentMethod,
  type TicketMethod,
} from "@/lib/payment";

type Props = {
  value: CheckoutPaymentMethod;
  onChange: (method: CheckoutPaymentMethod) => void;
  /** compact = carrito drawer; full = producto / checkout */
  compact?: boolean;
  /** Si se pasa, muestra el desplegable Pago Fácil / Rapipago al elegir efectivo */
  ticketMethod?: TicketMethod;
  onTicketMethodChange?: (method: TicketMethod) => void;
};

export function PaymentMethodPicker({
  value,
  onChange,
  compact,
  ticketMethod,
  onTicketMethodChange,
}: Props) {
  const optionClass = `flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-accent ${
    compact ? "py-2.5" : ""
  } border-line`;

  return (
    <fieldset className={compact ? "space-y-2" : "space-y-3"}>
      <legend className="text-sm font-medium text-ink">¿Cómo vas a pagar?</legend>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <label className={optionClass}>
          <input
            type="radio"
            name="paymentMethod"
            className="mt-1"
            checked={value === "mercadopago"}
            onChange={() => onChange("mercadopago")}
          />
          <span>
            <span className="block text-sm font-medium">
              Mercado Pago (tarjetas vinculadas)
            </span>
            <span className="text-xs text-ink-soft">
              Precio de lista. Visa, Mastercard, débito o dinero en cuenta.
            </span>
          </span>
        </label>

        <label className={optionClass}>
          <input
            type="radio"
            name="paymentMethod"
            className="mt-1"
            checked={value === "transfer"}
            onChange={() => onChange("transfer")}
          />
          <span>
            <span className="block text-sm font-medium">
              Transferencia · {TRANSFER_DISCOUNT_PERCENT}% OFF
            </span>
            <span className="text-xs text-ink-soft">
              Al confirmar te mostramos alias y CBU para copiar y transferir.
            </span>
          </span>
        </label>

        <div className={`rounded-lg border border-line has-[:checked]:border-accent`}>
          <label className={`flex cursor-pointer gap-3 p-3 ${compact ? "py-2.5" : ""}`}>
            <input
              type="radio"
              name="paymentMethod"
              className="mt-1"
              checked={value === "ticket"}
              onChange={() => onChange("ticket")}
            />
            <span>
              <span className="block text-sm font-medium">
                Efectivo · Pago Fácil o Rapipago
              </span>
              <span className="text-xs text-ink-soft">
                Precio de lista. Te generamos un cupón para pagar en la sucursal más cercana
                (vence en {TICKET_EXPIRATION_DAYS} días).
              </span>
            </span>
          </label>
          {value === "ticket" && ticketMethod && onTicketMethodChange && (
            <div className="border-t border-line px-3 pb-3 pt-2">
              <label className="block text-xs text-ink-soft">
                ¿Dónde querés pagar?
                <select
                  className="magi-input mt-1"
                  value={ticketMethod}
                  onChange={(e) => onTicketMethodChange(e.target.value as TicketMethod)}
                >
                  {(Object.keys(TICKET_METHOD_LABELS) as TicketMethod[]).map((m) => (
                    <option key={m} value={m}>
                      {TICKET_METHOD_LABELS[m]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
}
