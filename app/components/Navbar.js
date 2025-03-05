"use client"
import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"

const Navbar = () => {
  
      
      const { data: session } = useSession();
    if (session) {
        return (
            <div className='absolute text-black top-0 left-0 right-0 flex justify-end p-4'> 
                Signed in as {session.user.email} <br />
                <button className='relative text-black' onClick={() => signOut()}>Sign out</button>
            </div>
        )
    }
      
  
}

export default Navbar
