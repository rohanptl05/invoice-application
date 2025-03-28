"use server"

import connectDb from "@/db/connectDb"
import Client from "@/models/Client";
import mongoose from "mongoose";


export const fetchclient = async (id) => {
    await connectDb();
    // console.log("Fetching clients with ID:", id);

    let clients = await Client.find({ user: id }); // ✅ Correct usage for multiple results

    if (!clients || clients.length === 0) {
        return { error: "No clients found" };
    }

    return clients.map(client => client.toObject({ flattenObjectIds: true })); // ✅ Convert each document
};

export const deleteClient = async (id) => {
    try {
      await connectDb();
      console.log("Deleting client:", id);
  
      const client = await Client.findByIdAndDelete(id);
  
      if (!client) {
        return { error: "Client not found" };
      }
  
      return { success: true, message: "Client deleted successfully" };
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

    let clients = await Client.find({ _id:id }); // ✅ Correct usage for multiple results

    if (!clients || clients.length === 0) {
        return { error: "No clients found" };
    }

    return  { clients : JSON.parse(JSON.stringify(clients)) }
};