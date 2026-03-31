// Email notification service using Resend (recommended) or SendGrid

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, from = "NIRVAAAN <noreply@nirvaaan.app>" } = options;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("Mock Email Sent (Keys missing):", { to, subject });
      return { success: true, mock: true, data: "Mocked Email" };
    }

    // Using Resend API (recommended for Next.js)
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}

// Email templates
export const emailTemplates = {
  appointmentConfirmation: (data: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    type: string;
    meetLink?: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear ${data.patientName},</p>
            <p>Your appointment has been successfully booked!</p>
            
            <div class="details">
              <h3>Appointment Details:</h3>
              <p><strong>Doctor:</strong> ${data.doctorName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Type:</strong> ${data.type}</p>
              ${data.meetLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetLink}">${data.meetLink}</a></p>` : ""}
            </div>

            ${data.meetLink ? `<a href="${data.meetLink}" class="button">Join Video Call</a>` : ""}
            
            <p style="margin-top: 20px;">If you need to reschedule or cancel, please visit your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2026 NIRVAAAN. All rights reserved.</p>
            <p><a href="https://nirvaaan.app/terms">Terms</a> | <a href="https://nirvaaan.app/privacy">Privacy</a></p>
          </div>
        </div>
      </body>
    </html>
  `,

  prescriptionReady: (data: {
    patientName: string;
    doctorName: string;
    prescriptionNumber: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Prescription Ready</h1>
          </div>
          <div class="content">
            <p>Dear ${data.patientName},</p>
            <p>Dr. ${data.doctorName} has sent you a new prescription.</p>
            <p><strong>Prescription Number:</strong> ${data.prescriptionNumber}</p>
            <a href="https://nirvaaan.app/dashboard/records" class="button">View Prescription</a>
            <p style="margin-top: 20px;">You can order medicines directly from your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2026 NIRVAAAN. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};
