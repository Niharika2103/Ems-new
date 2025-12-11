import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Clean Indian numbers (ex: +91 90000 12345 → 9000012345)
export const cleanPhone = (value) =>
  value ? value.toString().replace(/\s+/g, "").replace("+91", "") : null;

export const sendSMS = async (to, message) => {
  try {
    if (!to) {
      console.log("❌ No phone number provided");
      return;
    }

    const cleaned = cleanPhone(to);

    const finalNumber = `+91${cleaned}`;

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: finalNumber,
    });

    console.log("📲 SMS sent successfully:", response.sid);
    return { success: true, sid: response.sid };
  } catch (err) {
    console.error("❌ SMS sending failed:", err.message);
    return { success: false, error: err.message };
  }
};
