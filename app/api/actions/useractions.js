"use server"

import connectDb from "@/db/connectDb"
import User from "@/models/User"



export const fetchuser = async (email) => {
    await connectDb();
    
    let user = await User.findOne({ email });
    if (!user) {
        return { error: "User not found" };
    }

    return user.toObject({ flattenObjectIds: true }); 
};




export const updateProfile = async (data, oldemail) => {
    await connectDb();

    let ndata = { ...data }; 
   

    // If the email is being updated, ensure the new email is not already in use
    if (oldemail !== ndata.email) {
        let userExists = await User.findOne({ email: ndata.email });

        if (userExists) {
            return { error: "This email is already in use" };
        }

        // Update user email
        await User.findOneAndUpdate({ email: oldemail }, { email: ndata.email, ...ndata });

        // Update the Payments table where this email is used
        await Payment.updateMany({ to_user: oldemail }, { to_user: ndata.email });
    } else {
        // Update the user details without changing the email
        await User.findOneAndUpdate({ email: ndata.email }, ndata);
    }

    return { success: "Profile updated successfully" };


}