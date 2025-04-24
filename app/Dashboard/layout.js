"use client"
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from 'next/navigation'
import { fetchuser } from "@/app/api/actions/useractions";








export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false); // Sidebar toggle state
  // const navigate = useNavigate();
  const { data: session } = useSession();

  const router = useRouter();
  useEffect(() => {
     if (!session) {
       router.push("/");
     } else {
       getData();
     }
   }, [session,router]);
    const getData = async () => {
       if (session?.user?.email) {
         let userData = await fetchuser(session.user.email);
         if (userData) {
          
           sessionStorage.setItem("id",userData._id)
       }
     };}

  // Close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  if (session) {
    return (
      <>
        <div className="container w-screen h-full flex flex-col md:flex-row min-h-screen text-black">
          {/* Top Bar (Mobile View) */}
          <div className="bg-slate-700 p-3 flex justify-between items-center md:hidden">
            <b className="text-white text-lg">Dashboard</b>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Sidebar */}
          <div
            className={` md:w-[20%] md:h-screen flex flex-col fixed md:static top-0 left-0 h-full z-50 bg-slate-400 transition-transform duration-300 ${isOpen ? "translate-x-0 w-[75%] sm:w-[60%]" : "-translate-x-full"
              } md:translate-x-0 md:flex`}
          >
            {/* Sidebar Header */}
            <div className="side-bar-header flex items-center p-4 space-x-2 md:space-x-0 md:flex-col">
              <img src={session.user.image} alt="user" className="w-[45px] h-[45px] rounded-full" />
              <b className="text-black text-sm md:text-lg mt-1">{session.user.name} </b>
            </div>

            {/* Sidebar Links */}
            <div className="side-bar-links flex flex-col flex-grow p-3">
              <ul className="flex flex-col space-y-2 flex-grow text-black ">
                <li className="w-full">
                  <Link className="block px-4 py-2 rounded-2xl hover:bg-green-500" href="/dashboard" onClick={handleLinkClick}>
                    Home
                  </Link>
                </li>
                <li className="w-full">
                  <Link className="block px-4 py-2 rounded-2xl  hover:bg-green-500" href="/dashboard/clients" onClick={handleLinkClick}>
                    Clients
                  </Link>
                </li>
                <li className="w-full">
                  <Link className="block px-4 py-2 rounded-2xl hover:bg-green-500" href="/dashboard/extra-expenses" onClick={handleLinkClick}>
                    Extra Expenses
                  </Link>
                </li>
                <li className="w-full">
                  <Link className="block px-4 py-2 rounded-2xl hover:bg-green-500" href="/dashboard/report" onClick={handleLinkClick}>
                    Report
                  </Link>
                </li>
                <li className="w-full">
                  <Link className="block px-4 py-2 rounded-2xl hover:bg-green-500" href="/dashboard/profile" onClick={handleLinkClick}>
                    Profile
                  </Link>
                </li>
                <li className="w-full">
                  <Link className="block px-4 py-2 rounded-2xl hover:bg-green-500" href="/dashboard/reminder" onClick={handleLinkClick}>
                  Reminder
                  </Link>
                </li>
                <li className="w-full">
                  <Link className="block px-4 py-2 rounded-2xl hover:bg-green-500" href="/dashboard/recyclebin" onClick={handleLinkClick}>
                    Recycle Bin
                  </Link>
                </li>
              </ul>

              {/* Log Out Button */}
              <ul className="mt-auto w-full">
                <li className="w-full">
                  <button
                    onClick={() => {
                      signOut();
                      sessionStorage.clear();
                    }}
                    className="block bg-red-800 text-white w-full p-2 text-center rounded-md"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content w-full md:w-[80%] p-4">
            {children}
          </div>
        </div>
      </>



    )
  }

}
