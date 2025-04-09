import { v2 as cloudinary } from "cloudinary";

import { NextResponse } from "next/server";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // ✅ Dot instead of comma!
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
// console.log("Cloudinary ENV:", {
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ loaded" : "✗ missing",
//   });



// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const timestamp = Math.floor(Date.now() / 1000);
//     const {  public_id, use_filename } = body;

//     const paramsToSign = {
//       timestamp,
//       // folder,
//       public_id,
//       use_filename,
//     };

//     // Remove undefined or empty values
//     const filteredParams = Object.fromEntries(
//       Object.entries(paramsToSign).filter(([_, v]) => v !== undefined && v !== "")
//     );

//     const signature = cloudinary.utils.api_sign_request(
//       filteredParams,
//       process.env.CLOUDINARY_API_SECRET
//     );
//     console.log("String to sign:", cloudinary.utils.sign_request(
//       filteredParams,
//       process.env.CLOUDINARY_API_SECRET
//     ));
    
//     return new Response(JSON.stringify({
//       ...filteredParams,
//       signature,
//       apiKey: process.env.CLOUDINARY_API_KEY,
//       cloudName: process.env.CLOUDINARY_CLOUD_NAME
//     }), { status: 200 });
//   } catch (err) {
//     console.error("Signature Error:", err);
//     return new Response("Error creating signature", { status: 500 });
//   }
// }
// export async function POST(req) {
//   try {
//     const body = await req.json();
//     console.log("body:",body);
//     const timestamp = Math.floor(Date.now() / 1000);

//     // ✅ Match ALL frontend-sent fields
//     const paramsToSign = {
//       timestamp,
//       upload_preset: body.paramsToSign.upload_preset,    
//       use_filename: true,
//       unique_filename: true,
//     };
//     console.log( "paramsToSign:",paramsToSign);

//     const filteredParams = Object.fromEntries(
//       Object.entries(paramsToSign).filter(([_, v]) => v !== undefined && v !== "")
//     );

//     const signature = cloudinary.utils.api_sign_request(
//       filteredParams,
//       process.env.CLOUDINARY_API_SECRET
//     );

//     // console.log("String to sign:", cloudinary.utils.sign_request(
//     //   filteredParams,
//     //   process.env.CLOUDINARY_API_SECRET
//     // ));
    

//     return new Response(JSON.stringify({
//       ...filteredParams,
//       signature,
//       apiKey: process.env.CLOUDINARY_API_KEY,
//       cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//     }), { status: 200 });

//   } catch (err) {
//     console.error("Signature Error:", err);
//     return new Response("Error creating signature", { status: 500 });
//   }
// }


// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const timestamp = Math.floor(Date.now() / 1000);
//     const {
//       upload_preset,
//       folder,
//       tags,
//       source,
//       use_filename,
//       unique_filename,
//     } = body.paramsToSign;

//     const paramsToSign = {
//       timestamp,
//       upload_preset,
//       folder,
//       tags: Array.isArray(tags) ? tags.join(',') : tags,
//       source,
//       use_filename,
//       unique_filename,
//     };

//     const filteredParams = Object.fromEntries(
//       Object.entries(paramsToSign).filter(([_, v]) => v !== undefined && v !== "")
//     );

//     const signature = cloudinary.utils.api_sign_request(
//       filteredParams,
//       process.env.CLOUDINARY_API_SECRET
//     );


//     console.log("paramsToSign:", filteredParams);
// console.log("String to sign:", cloudinary.utils.sign_request(filteredParams, process.env.CLOUDINARY_API_SECRET));

//     return new Response(JSON.stringify({
//       ...filteredParams,
//       signature,
//       apiKey: process.env.CLOUDINARY_API_KEY,
//       cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//     }), { status: 200 });

//   } catch (err) {
//     console.error("Signature Error:", err);
//     return new Response("Error creating signature", { status: 500 });
//   }
// }

export async function POST(req) {
  try {
    const body = await req.json();
    const timestamp = Math.floor(Date.now() / 1000);

    const {
      upload_preset,
      folder,
      tags,
      source,
      use_filename,
      unique_filename,
    } = body.paramsToSign;

    // 👇 Tags must be a comma-separated string
    const paramsToSign = {
      folder,
      source,
      tags: Array.isArray(tags) ? tags.join(",") : tags,
      timestamp,
      unique_filename,
      upload_preset,
      use_filename,
    };

    // 👇 Remove empty keys
    const filteredParams = Object.fromEntries(
      Object.entries(paramsToSign).filter(([_, v]) => v !== undefined && v !== "")
    );

    // ✅ Create signature
    const signature = cloudinary.utils.api_sign_request(
      filteredParams,
      process.env.CLOUDINARY_API_SECRET
    );

    return new Response(
      JSON.stringify({
        ...filteredParams,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Signature Error:", err);
    return new Response("Error creating signature", { status: 500 });
  }
}