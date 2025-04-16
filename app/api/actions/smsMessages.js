
require('dotenv').config({ path: '.env.local' }); // ✅ Load .env.local

import connectDB from "@/db/connectDb";
import Message from "@/models/Message"
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function GET() {
  await connectDB();

  const now = new Date();

  const messages = await Message.find({ sendAt: { $lte: now }, sent: false }).sort({sendAt : -1});

  for (const msg of messages) {
    // send sendAd to local time and thand send india
    try {
      await client.messages.create({
        body: msg.body,
        to: msg.to,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
        sendAt: msg.sendAt,
      });
      msg.sent = true,
      msg.status ='Delivered',
      await msg.save();
    } catch (err) {
      console.error(`❌ Failed to send message:`, err.message);
    }
  }

  return { success: true, message: "Messages  successfully scheduled" };;
}
