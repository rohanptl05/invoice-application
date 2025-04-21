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
    connectDB();
    if (id) {
      let messages = await Message.find({ user: id }).sort({ createdAt: -1 });
  
      if (!messages || messages.length === 0) {
        return null; // Return null instead of { null }
      }
  
      return messages.map((message) => message.toObject({ flattenObjectIds: true }));
    }
  };

  
  export const DeleteMassege = async (id) => {
    connectDB();
    try {
      const message = await Message.findById(id);
      
      // If the message is not found
      if (!message) {
        return { message: "Message not found" };
      }
  
      // Delete the message
      await Message.findByIdAndDelete(id);
      return { success : true ,message: "Message deleted successfully" };
      
    } catch (error) {
      console.error("Error deleting message:", error);
      return { message: "An error occurred while deleting the message" };
    }
  };
  