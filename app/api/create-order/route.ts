
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, currency } = body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.log("Using Mock Razorpay Order (Keys missing)");
            return NextResponse.json({
                id: `order_mock_${Date.now()}`,
                amount: amount * 100,
                currency: currency || "INR",
                receipt: `receipt_mock_${Date.now()}`
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100, // Amount in paise
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Razorpay Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create order" },
            { status: 500 }
        );
    }
}
