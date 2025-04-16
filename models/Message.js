import mongoose from 'mongoose';

const { Schema } = mongoose;

const MessageSchema = new mongoose.Schema({
     user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true,
     },
  body: String,
  to: String,
  sendAt: Date,
  status: {
    type: String,
    enum: ["Scheduled", "Delivered"],
    default: "Scheduling.."
  },
  sent: { type: Boolean, default: false },
  twilioSid: String,
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
