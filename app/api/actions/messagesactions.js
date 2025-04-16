"use server"
import Message from "@/models/Message"
import connectDB from "@/db/connectDb";
import mongoose from "mongoose";
import twilio from 'twilio';
require('dotenv').config({ path: '.env.local' });


export const Addmessages = async (data) => {
    await connectDB();
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
        const scheduledTime = new Date(data.sendAt).toISOString(); // Ensure it's in UTC format

        // Schedule message with Twilio
        
        // Save in MongoDB
        const twilioMessage = await client.messages.create({
            body: data.body,
            to:'+918511229451',
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            scheduleType: 'fixed',
            sendAt: scheduledTime,
        });
        const newMessage = await Message.create({
            user: new mongoose.Types.ObjectId(data.user),
            body: data.body,
            to: data.to,
            sendAt: scheduledTime,
            sent: false,
            status: 'Scheduled',
            twilioSid: twilioMessage.sid,
        });
       
        return { success: true };


    } catch (error) {
        console.error("Error adding Messages:", error);
        return null;

    }
}





export const fetchMessages = async (id) => {
    connectDB()
    if (id) {
        let mesages = await Message.find({ user: id }).sort({ createdAt: -1 }); // ✅ Correct usage for multiple results

        if (!mesages || mesages.length === 0) {
            return { error: "No masages found" }
        }


        return mesages.map(mesages => mesages.toObject({ flattenObjectIds: true })); // ✅ Convert each document
    }

}
