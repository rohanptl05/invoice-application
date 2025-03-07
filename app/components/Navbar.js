"use client"
import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"

const Navbar = () => {
    const { data: session } = useSession();

    if (session) {
        return (
            <div className='absolute text-black top-0 left-0 right-0 flex flex-col items-end p-4'> 
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

    return (
        <div className='absolute top-0 right-0 p-4'>
            <button 
                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                onClick={() => signIn()}
            >
                Sign in
            </button>
        </div>
    );
}

export default Navbar;
