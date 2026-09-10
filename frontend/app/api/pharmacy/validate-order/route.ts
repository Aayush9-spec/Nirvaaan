import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { apiError } from "@/lib/api-utils";

const ValidationSchema = z.object({
    orderId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return apiError("Unauthorized", 401);

        // Verify role is pharmacy
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (profile?.role !== 'pharmacy') return apiError("Forbidden: Pharmacy role required", 403);

        const body = await req.json();
        const validation = ValidationSchema.safeParse(body);
        if (!validation.success) return apiError("Invalid request data", 400, validation.error.format());

        const { orderId } = validation.data;

        // 1. Fetch order and its items
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, record_items(*)')
            .eq('id', orderId)
            .single();

        if (orderError || !order) return apiError("Order not found", 404);
        if (order.fulfillment_status !== 'pending') return apiError("Order is already being processed", 400);

        // 2. Verify stock in pharmacy_inventory
        const items = order.record_items || [];
        if (items.length === 0) return apiError("No items found in this prescription", 400);

        const inventoryChecks = await Promise.all(
            items.map(async (item: any) => {
                const { data: stock } = await supabase
                    .from('pharmacy_inventory')
                    .select('stock_quantity')
                    .eq('medicine_name', item.name)
                    .single();
                return { name: item.name, available: (stock?.stock_quantity || 0) >= 1 };
            })
        );

        const unavailable = inventoryChecks.filter(c => !c.available).map(c => c.name);

        if (unavailable.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: "Insufficient stock", 
                unavailable 
            }, { status: 400 });
        }

        // 3. Update status to 'validated'
        const { error: updateError } = await supabase
            .from('orders')
            .update({ fulfillment_status: 'validated' })
            .eq('id', orderId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: "Order validated and stock reserved" });

    } catch (error: any) {
        return apiError(error.message || "Internal validation error", 500);
    }
}
