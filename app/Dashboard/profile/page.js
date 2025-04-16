"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchuser, updateProfile } from "@/app/api/actions/useractions";

const Page = () => {
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({});

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
        setForm(userData);
        
    }
  };}

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   const u= await updateProfile(form, session.user.email);
   if(u){
    alert("Profile updated successfully")
   }
  };

  if (!session) return null;

  return (
    <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>
      <div className="my-2">
        <label htmlFor="name" className="block mb-2 text-sm font-medium text-black">Name</label>
        <input
          onChange={handleChange}
          value={form.name || ""}
          type="text"
          name="name"
          id="name"
          placeholder="Name"
          className="block w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="relative my-2">
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-black">Email</label>
        <input
          type="text"
          name="email"
          id="email"
          placeholder="Email"
          value={form.email || ""}
          disabled
          className="block w-full p-2 border border-gray-300 rounded-lg"
          onMouseOver={() => setPopoverVisible(true)}
          onMouseLeave={() => setPopoverVisible(false)}
        />
        {isPopoverVisible && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 p-4 text-sm bg-white border rounded-lg shadow-lg text-gray-700 border-gray-200 shadow-gray-300">
            Email can&apos;t be changed
          </div>
        )}
      </div>

      <div className="my-2">
        <label htmlFor="image" className="block mb-2 text-sm font-medium text-black">Image URL</label>
        <input
          onChange={handleChange}
          value={form.image || ""}
          type="text"
          name="image"
          id="image"
          placeholder="Image URL"
          className="block w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="my-2">
        <label htmlFor="address" className="block mb-2 text-sm font-medium text-black">Address</label>
        <input
          onChange={handleChange}
          value={form.address || ""}
          type="text"
          name="address"
          id="address"
          placeholder="Address"
          className="block w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="my-2">
        <label htmlFor="phone" className="block mb-2 text-sm font-medium text-black">Phone</label>
        <input
          onChange={handleChange}
          value={form.phone || ""}
          type="text"
          name="phone"
          id="phone"
          placeholder="Phone"
          className="block w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="my-2">
        <label htmlFor="company" className="block mb-2 text-sm font-medium text-black">Company</label>
        <input
          onChange={handleChange}
          value={form.company || ""}
          type="text"
          name="company"
          id="company"
          placeholder="Company"
          className="block w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* <div className="my-2">
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-black">Password</label>
        <input
          onChange={handleChange}
          type="password"
          value={form.password || ""}
          name="password"
          id="password"
          placeholder="Password"
          className="block w-full p-2 border border-gray-300 rounded-lg"
        />
      </div> */}

      <div className="my-6">
        <button type="submit" className="block w-full p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
          Save
        </button>
      </div>
    </form>
  );
};

export default Page;
