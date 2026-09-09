import { NextResponse } from "next/server";
import { dbGetOrderByNumber } from "@/lib/db";
import {
  createPreferenceForOrder,
  isMercadoPagoReady,
} from "@/lib/mercadopago";
import { createServerDataClient, hasServiceRole, useSupabaseData } from "@/lib/supabase/admin";

/** Crea el Checkout Pro de Mercado Pago con el monto del pedido ya cargado. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.orderNumber ?? "").trim();
    if (!orderNumber) {
      return NextResponse.json({ error: "Falta el pedido" }, { status: 400 });
    }

    if (!(await isMercadoPagoReady())) {
      return NextResponse.json(
        {
          error:
            "El pago online aún no está activado. Usá la transferencia por alias o CBU más abajo.",
          needs_token: true,
        },
        { status: 400 },
      );
    }

    const order = await dbGetOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const pref = await createPreferenceForOrder(order);

    if (useSupabaseData() && hasServiceRole()) {
      try {
        const sb = createServerDataClient();
        await sb
          .from("orders")
          .update({ mp_preference_id: pref.id })
          .eq("id", order.id);
      } catch {
        /* ok */
      }
    }

    return NextResponse.json({
      init_point: pref.init_point,
      preferenceId: pref.id,
    });
  } catch (error) {
    console.error("MP preference:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo abrir Mercado Pago con el monto",
      },
      { status: 500 },
    );
  }
}
