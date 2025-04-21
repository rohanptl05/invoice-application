"use server"

import connectDb from "@/db/connectDb"
import Client from "@/models/Client";
import  Invoice from "@/models/Invoice";
import  ReceivedAmount  from "@/models/ReceivedAmount";
import mongoose from "mongoose";
import  NextResponse  from "next/server";


export const fetchclient = async (id,status) => {
    await connectDb();
    // console.log("Fetching clients with ID:", id);

    let clients = await Client.find({ user: id, clientStatus: status }).sort({ createdAt: -1 }); // ✅ Correct usage for multiple results

    if (!clients || clients.length === 0) {
        return { error: "No clients found" }
    }

    return clients.map(client => client.toObject({ flattenObjectIds: true })); // ✅ Convert each document
};

export const deleteClient = async (id) => {
    try {
        await connectDb();
        // console.log("Deleting client:", id);

        const client = await Client.findById(id);
        // console.log(client, "client")
if (!client) {
            return { error: "Client not found" };
        }
        try {
            await Client.findOneAndUpdate(
                { _id: id },  // Find by the correct ID
                { $set: {
                    clientStatus: "deactivated" ,// Update the fields
                    deactivatedAt: new Date() // Set the deactivated date to now

                } }, // Update the fields
                { new: true }  // Return the updated document
            );

            await Invoice.updateMany(
                { client: id },
                { $set: { recordStatus: "deactivated",
                    deactivatedAt: new Date() } }, // Update the fields
                 
            );
            await ReceivedAmount.updateMany(
                { client: id },
                { $set: {  recordStatus: "deactivated",
                    deactivatedAt: new Date() } }, // Update the fields
                 
            );

    
            return { success: "Client Deleted successfully" };
        } catch (error) {
            console.error("Error Deleted client:", error);
            return { error: "Failed to Deleted client" };
        }
        
    } catch (error) {
        console.error("Error deleting client:", error);
        return { error: "Failed to delete client" };
    }
};

export const updateClient = async (data, id) => {
    await connectDb();

    // Ensure the client exists before updating
    let clientExists = await Client.findOne({ _id: id });

    if (!clientExists) {
        return { error: "Client does not exist" };
    }

    try {
        await Client.findOneAndUpdate(
            { _id: id },  // Find by the correct ID
            { $set: data }, // Update the fields
            { new: true }  // Return the updated document
        );

        return { success: "Client updated successfully" };
    } catch (error) {
        console.error("Error updating client:", error);
        return { error: "Failed to update client" };
    }
};




export const AddClient = async (data) => {
    try {
        await connectDb(); // Ensure database connection is established

        // Ensure userId is provided and is a valid ObjectId
        if (!data.user || !mongoose.Types.ObjectId.isValid(data.user)) {
            return { error: "Invalid or missing user ID" };
        }

        if (!data.name || !data.email || !data.phone || !data.address) {
            return { error: "Missing required fields" };
        }

        const newClient = await Client.create({
            user: new mongoose.Types.ObjectId(data.user), // Convert user ID
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address
        });


        return { success: "Client Added", client: JSON.parse(JSON.stringify(newClient)) };

    } catch (error) {
        console.error("Error adding client:", error);
        return { error: "Database error: " + error.message };
    }
};


export const fetchSingleclient = async (id) => {
    await connectDb();
    // console.log("Fetching clients with ID:", id);

    let clients = await Client.find({ _id: id }).populate("user"); // ✅ Correct usage for multiple results

    if (!clients || clients.length === 0) {
        return { error: "No clients found" };
    }

    return { clients: JSON.parse(JSON.stringify(clients)) }
};

// export const fetchSearchClient = async (id, search) => {
//     await connectDb();
//     // console.log(search, id, "search client")
    
//     let clients = await Client.aggregate([
//         {
//             $match: {
//                 user: new mongoose.Types.ObjectId(id), // Filter by user ID
//                 $or: [
//                     { name: { $regex: search, $options: "i" } },  // Partial match, case-insensitive
//                     { email: { $regex: search, $options: "i" } },
//                     { phone: { $regex: search, $options: "i" } }
//                 ]
//             }
//         }
//     ]).sort({ createdAt: -1 });

//     if (!clients || clients.length === 0) {
//         return { error: "No clients found" };
//     }

   
//     return { clients: JSON.parse(JSON.stringify(clients)) }
// };

