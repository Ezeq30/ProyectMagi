"use client";

import { useMemo, useState } from "react";
import { ColorSwatches } from "@/components/ColorSwatches";
import { PaymentMethodPicker } from "@/components/PaymentMethodPicker";
import { PaymentMethodsStrip } from "@/components/PaymentMethodsStrip";
import { useCart } from "@/lib/cart/store";
import {
  colorVariantsOf,
  imageForColorVariant,
} from "@/lib/color-swatch";
import { formatPrice } from "@/lib/format";
import {
  CASH_DISCOUNT_PERCENT,
  cashPrice,
  type CheckoutPaymentMethod,
} from "@/lib/payment";
import type { Product } from "@/lib/types";

export function AddToCartPanel({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const cartPaymentMethod = useCart((s) => s.paymentMethod);
  const colorVariants = useMemo(
    () => colorVariantsOf(product.variants),
    [product.variants],
  );
  const firstAvailable =
    colorVariants.find((v) => v.stock > 0)?.id ?? colorVariants[0]?.id;
  const [variantId, setVariantId] = useState(firstAvailable);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>(cartPaymentMethod);
  const selected = useMemo(
    () => colorVariants.find((v) => v.id === variantId) ?? colorVariants[0],
    [colorVariants, variantId],
  );
  const selectedIndex = Math.max(
    0,
    colorVariants.findIndex((v) => v.id === variantId),
  );
  const stock = selected?.stock ?? product.stock;
  const out = stock <= 0;
  const mustPickColor = colorVariants.length > 0 && !selected;
  const priceCash = cashPrice(product.price);
  const cartImage = imageForColorVariant(
    product.images,
    selected,
    selectedIndex,
    "",
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
        {product.compare_at && product.compare_at > product.price && (
          <p className="text-ink-soft line-through">{formatPrice(product.compare_at)}</p>
        )}
        <p className="mt-1 text-sm text-ink-soft">
          En efectivo: <strong className="text-ink">{formatPrice(priceCash)}</strong>{" "}
          ({CASH_DISCOUNT_PERCENT}% OFF)
        </p>
      </div>

      {colorVariants.length > 0 && (
        <div>
          <p className="text-sm">
            Color: <strong>{selected?.value ?? "Elegí uno"}</strong>
            {selected ? (
              <span className="text-ink-soft"> · {selected.stock} disponibles</span>
            ) : null}
          </p>
          <div className="mt-3">
            <ColorSwatches
              colors={colorVariants}
              selectedId={variantId}
              onSelect={setVariantId}
              size="md"
            />
          </div>
        </div>
      )}

      <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

      <PaymentMethodsStrip compact />

      <button
        type="button"
        disabled={out || mustPickColor}
        className="magi-btn disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() =>
          addItem(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: cartImage || product.images[0] || "",
              quantity: 1,
              maxStock: stock,
              variantId: selected?.id,
              variantLabel: selected ? `Color: ${selected.value}` : undefined,
            },
            paymentMethod,
          )
        }
      >
        {out
          ? "Sin stock"
          : paymentMethod === "cash"
            ? `Agregar · efectivo ${formatPrice(priceCash)}`
            : "Agregar al carrito"}
      </button>
    </div>
  );
}
