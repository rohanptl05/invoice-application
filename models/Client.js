import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 32
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        maxLength: 10
    },
    address: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });


const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);


export default Client;