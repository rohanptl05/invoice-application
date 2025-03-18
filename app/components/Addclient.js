import React, { useState } from 'react';
import { AddClient } from '../api/actions/clientactions';

const Addclient = ({ getData,onClose, onSubmit, initialData }) => {
  const userId = sessionStorage.getItem('id'); // Ensure user ID is retrieved

  const [formData, setFormData] = useState(
    initialData || { user: userId, name: "", email: "", phone: "", address: "" }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure userId is included in formData
    if (!userId) {
      alert("Error: User ID is missing!");
      return;
    }

    const finalData = { ...formData, user: userId };

    console.log("Submitting Data:", finalData); // Debugging log

    const response = await AddClient(finalData);

    if (response.success) {
      console.log("Client added successfully:", response.success);
      onSubmit && onSubmit();
      onClose && onClose();
      // getData()
    } else {
      console.error("Error adding client:", response.error);
      alert("Error: " + response.error); // Display error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-lg">
      {/* User ID (Read-Only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">User ID</label>
        <input
          type="text"
          name="user"
          value={userId || ""}
          readOnly
          className="w-full p-2 border rounded-lg bg-gray-200"
        />
      </div>

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter full name"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter email address"
          required
        />
      </div>

      {/* Phone Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter phone number"
          maxLength="10"
          required
        />
      </div>

      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter client address"
          rows="3"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 mt-4">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg">
          {initialData ? "Update Client" : "Add Client"}
        </button>
        <button
          type="button"
          onClick={() => onClose && onClose()}
          className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-5 py-2.5 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Addclient;
