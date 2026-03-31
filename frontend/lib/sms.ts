// SMS notification service using Twilio

export interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS(options: SMSOptions) {
  const { to, message } = options;

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.log("Mock SMS Sent (Keys missing):", { to, message });
      return { success: true, mock: true, data: "Mocked SMS" };
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "SMS sending failed");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("SMS sending error:", error);
    return { success: false, error: error.message };
  }
}

// SMS templates
export const smsTemplates = {
  appointmentReminder: (data: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
  }) =>
    `Hi ${data.patientName}, reminder: Your appointment with ${data.doctorName} is scheduled for ${data.date} at ${data.time}. - NIRVAAAN`,

  appointmentConfirmation: (data: {
    doctorName: string;
    date: string;
    time: string;
  }) =>
    `Your appointment with ${data.doctorName} on ${data.date} at ${data.time} has been confirmed. - NIRVAAAN`,

  prescriptionReady: (data: { prescriptionNumber: string }) =>
    `Your prescription #${data.prescriptionNumber} is ready. View it in your NIRVAAAN dashboard. - NIRVAAAN`,

  appointmentCancelled: (data: { doctorName: string; date: string }) =>
    `Your appointment with ${data.doctorName} on ${data.date} has been cancelled. Please reschedule. - NIRVAAAN`,
};
