"use client";

import {
  CASH_DISCOUNT_PERCENT,
  type CheckoutPaymentMethod,
} from "@/lib/payment";

type Props = {
  value: CheckoutPaymentMethod;
  onChange: (method: CheckoutPaymentMethod) => void;
  /** compact = carrito drawer; full = producto / checkout */
  compact?: boolean;
};

export function PaymentMethodPicker({ value, onChange, compact }: Props) {
  return (
    <fieldset className={compact ? "space-y-2" : "space-y-3"}>
      <legend className={`font-medium text-ink ${compact ? "text-sm" : "text-sm"}`}>
        ¿Cómo vas a pagar?
      </legend>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <label
          className={`flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-accent ${
            compact ? "py-2.5" : ""
          } border-line`}
        >
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
              Precio de lista. Visa, Mastercard, débito, transferencia o dinero en cuenta.
            </span>
          </span>
        </label>
        <label
          className={`flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-accent ${
            compact ? "py-2.5" : ""
          } border-line`}
        >
          <input
            type="radio"
            name="paymentMethod"
            className="mt-1"
            checked={value === "cash"}
            onChange={() => onChange("cash")}
          />
          <span>
            <span className="block text-sm font-medium">
              Efectivo · {CASH_DISCOUNT_PERCENT}% OFF
            </span>
            <span className="text-xs text-ink-soft">
              Se aplica {CASH_DISCOUNT_PERCENT}% de descuento sobre el precio publicado.
              Se coordina el pago con Magali.
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
