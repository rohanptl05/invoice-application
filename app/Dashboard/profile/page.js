"use client"
import React from 'react'

import { useSession, signIn, signOut } from "next-auth/react"

const page = () => {
  const { data: session } = useSession();
 
     if (session) {
         return (
             <div className='absolute text-black  flex flex-col items-end p-4'> 
                 <p>Signed in as <strong>{session.user.email}</strong></p>
                 
                 {/* ✅ Log Session Object */}
                 {console.log("Session Data:", session)}
 
                 {/* ✅ Show All Session Data */}
                 <pre className="bg-gray-100 p-2 text-black text-sm border border-gray-300 rounded-md">
                     {JSON.stringify(session, null, 2)}
                 </pre>
 
                 <button 
                     className='mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600' 
                     onClick={() => signOut()}
                 >
                     Sign out
                 </button>
             </div>
         );
     }
}

export default page
