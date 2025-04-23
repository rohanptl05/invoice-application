"use server";

import Message from "@/models/Message";
import connectDB from "@/db/connectDb";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

    const messages = await Message.find({
      sendAt: {
        $gte: startOfToday,
        $lte: endOfToday
      },
      sent: false
    }).sort({ sendAt: -1 });

    for (const msg of messages) {
      try {
        const message = await client.messages.create({
          body: msg.body,
          messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
          to: msg.to
        });

        console.log("✅ Sent message SID:", message.sid);

        msg.sent = true;
        await msg.save();
      } catch (err) {
        console.error("❌ Failed to send message:", msg._id, err.message);
      }
    }

    return Response.json({ success: true, sent: messages.length });
  } catch (err) {
    console.error("❌ SMS sending job failed:", err.message);
    return Response.json({ success: false, error: err.message });
  }
}
