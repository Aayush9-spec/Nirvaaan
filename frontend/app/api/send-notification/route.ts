import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from "zod";
import { apiError } from "@/lib/api-utils";

const NotifSchema = z.object({
    type: z.enum(["appointment_confirmation", "prescription_ready"]),
    data: z.object({
        email: z.string().email(),
        patientName: z.string().optional(),
        doctorName: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
    }),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return apiError("Unauthorized", 401);

        const body = await req.json();
        const validation = NotifSchema.safeParse(body);
        if (!validation.success) return apiError("Invalid notification data", 400, validation.error.format());

        const { type, data } = validation.data;
        let emailHtml = "";
        let subject = "";

        if (type === "appointment_confirmation") {
            subject = "Appointment Confirmed - NIRVAAAN";
            emailHtml = emailTemplates.appointmentConfirmation(data);
        } else if (type === "prescription_ready") {
            subject = "New Prescription Available - NIRVAAAN";
            emailHtml = emailTemplates.prescriptionReady(data);
        }

        const result = await sendEmail({ to: data.email, subject, html: emailHtml });
        if (result.success) return NextResponse.json({ success: true, message: "Notification sent" });
        return apiError(result.error || "Email failed", 500);
    } catch (error: any) {
        return apiError(error.message || "Internal error", 500);
    }
}
