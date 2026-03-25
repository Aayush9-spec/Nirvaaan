import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, data } = await req.json();

    let emailHtml = "";
    let subject = "";

    switch (type) {
      case "appointment_confirmation":
        subject = "Appointment Confirmed - MedAI";
        emailHtml = emailTemplates.appointmentConfirmation(data);
        break;
      
      case "prescription_ready":
        subject = "New Prescription Available - MedAI";
        emailHtml = emailTemplates.prescriptionReady(data);
        break;
      
      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    const result = await sendEmail({
      to: data.email,
      subject,
      html: emailHtml,
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Notification sent" });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}
