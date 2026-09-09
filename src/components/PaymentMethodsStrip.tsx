import { CASH_DISCOUNT_PERCENT } from "@/lib/payment";
import type { ReactNode } from "react";

type Props = {
  compact?: boolean;
  className?: string;
  /** dark footer background */
  inverted?: boolean;
  hideHeading?: boolean;
};

function Badge({
  label,
  children,
  title,
}: {
  label: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title ?? label}
      className="inline-flex h-8 min-w-[2.75rem] items-center justify-center rounded-md border border-black/10 bg-white px-2 shadow-sm sm:h-10 sm:min-w-[3.5rem] sm:px-2.5"
    >
      {children}
      <span className="sr-only">{label}</span>
    </span>
  );
}

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 16" className="h-4 w-10" aria-hidden>
      <path
        fill="#1A1F71"
        d="M18.4 15.2h-2.7l1.7-10.4h2.7l-1.7 10.4zm11.2-10.1c-.5-.2-1.4-.4-2.5-.4-2.7 0-4.7 1.4-4.7 3.5 0 1.5 1.4 2.4 2.5 2.9 1.1.5 1.5.9 1.5 1.4 0 .7-.9 1.1-1.7 1.1-1.1 0-1.8-.2-2.7-.6l-.4-.2-.4 2.4c.7.3 2 .6 3.4.6 2.9 0 4.8-1.4 4.8-3.6 0-1.2-.7-2.1-2.4-2.9-1-.5-1.6-.9-1.6-1.4 0-.5.5-.9 1.6-.9.9 0 1.6.2 2.1.4l.3.1.4-2.3zm7.2-.3h-2.1c-.6 0-1.1.2-1.4.8l-3.9 9.6h2.8l.5-1.5h3.4l.3 1.5h2.5L36.8 4.8zm-3 6.4 1.4-3.8.8 3.8h-2.2zM15.5 4.8l-2.6 10.4H10.1L7.8 7.1c-.1-.5-.3-.7-.7-.9C6.3 5.8 5.4 5.5 4.5 5.3l.1-.5h4.5c.6 0 1.1.4 1.2 1.1l1.1 6 2.8-7.1h2.8z"
      />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 38 24" className="h-5 w-8" aria-hidden>
      <circle cx="14" cy="12" r="8" fill="#EB001B" />
      <circle cx="24" cy="12" r="8" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M19 5.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z"
      />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 40 16" className="h-4 w-11" aria-hidden>
      <rect width="40" height="16" rx="2" fill="#2E77BC" />
      <text
        x="20"
        y="11.2"
        textAnchor="middle"
        fill="#fff"
        fontSize="6.2"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        letterSpacing="0.4"
      >
        AMEX
      </text>
    </svg>
  );
}

function MercadoPagoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#009EE3"
        d="M12.4 2.2c-3.2 0-5.8 1.1-7.7 3.2C2.7 7.5 1.8 10.2 1.8 13.3c0 2.2.5 4.1 1.5 5.6.9 1.4 2.2 2.4 3.8 3.1l.7.3V16.8c0-1.5.5-2.8 1.4-3.8.9-1 2.1-1.6 3.5-1.8V2.2h-.3z"
      />
      <path
        fill="#009EE3"
        d="M12.7 2.2v8.9c1.3.2 2.4.8 3.2 1.7.9 1 1.4 2.3 1.4 3.9v5.5l.7-.3c1.6-.7 2.9-1.7 3.8-3.1 1-1.5 1.5-3.4 1.5-5.6 0-3.1-.9-5.8-2.9-7.9-1.9-2.1-4.5-3.2-7.7-3.2v.1z"
        opacity=".85"
      />
    </svg>
  );
}

function CashIcon() {
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-ink sm:text-xs">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" strokeLinecap="round" />
      </svg>
      Efectivo
    </span>
  );
}

function CabalIcon() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-12" aria-hidden>
      <text
        x="24"
        y="12"
        textAnchor="middle"
        fill="#0033A0"
        fontSize="10"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        letterSpacing="1"
      >
        CABAL
      </text>
    </svg>
  );
}

export function PaymentMethodsStrip({
  compact,
  className = "",
  inverted,
  hideHeading,
}: Props) {
  return (
    <div className={className}>
      {!inverted && !hideHeading && (
        <>
          <p className="text-sm font-medium text-ink">Medios de pago</p>
          <p className="mt-1 text-xs text-ink-soft">
            Mercado Pago (tarjetas vinculadas) · Efectivo con {CASH_DISCOUNT_PERCENT}% OFF
          </p>
        </>
      )}
      <div
        className={`flex flex-wrap items-center gap-2 ${
          inverted || hideHeading ? "justify-center" : "mt-3"
        } ${compact ? "gap-1.5" : "gap-2"}`}
      >
        <Badge label="Visa">
          <VisaIcon />
        </Badge>
        <Badge label="Mastercard">
          <MastercardIcon />
        </Badge>
        <Badge label="American Express">
          <AmexIcon />
        </Badge>
        <Badge label="Cabal">
          <CabalIcon />
        </Badge>
        <Badge label="Mercado Pago">
          <MercadoPagoIcon />
        </Badge>
        <Badge label={`Efectivo ${CASH_DISCOUNT_PERCENT}% OFF`} title={`Efectivo · ${CASH_DISCOUNT_PERCENT}% OFF`}>
          <CashIcon />
        </Badge>
      </div>
      {(inverted || hideHeading) && (
        <p
          className={`mt-3 text-center text-xs ${
            inverted ? "text-[#d8d0c4]" : "text-ink-soft"
          }`}
        >
          Efectivo: {CASH_DISCOUNT_PERCENT}% OFF sobre el precio publicado
        </p>
      )}
    </div>
  );
}
