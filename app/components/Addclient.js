import React, { useState } from 'react';
import { AddClient } from '../api/actions/clientactions';

const Addclient = ({ getData, onClose, onSubmit, initialData }) => {
  const userId = sessionStorage.getItem('id'); // Ensure user ID is retrieved

  const [formData, setFormData] = useState(
    initialData || { user: userId, name: "", email: "", phone: "", address: "" }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Error: User ID is missing!");
      return;
    }

    const finalData = { ...formData, user: userId };

    const response = await AddClient(finalData);

    if (response.success) {
      onSubmit && onSubmit();
      onClose && onClose();
      getData()
    } else {
      alert("Error: " + response.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
    {/* Name Field */}
    <div>
      <label className="block text-sm font-semibold text-gray-700">Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter full name"
        required
      />
    </div>

    {/* Email Field */}
    <div>
      <label className="block text-sm font-semibold text-gray-700">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter email address"
        required
      />
    </div>

    {/* Phone Field */}
    <div>
      <label className="block text-sm font-semibold text-gray-700">Phone</label>
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter phone number"
        maxLength="10"
        required
      />
    </div>

    {/* Address Field */}
    <div>
      <label className="block text-sm font-semibold text-gray-700">Address</label>
      <textarea
        name="address"
        value={formData.address}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter client address"
        rows="3"
        required
      />
    </div>

    {/* Buttons */}
    <div className="flex justify-end space-x-4">
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg">
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
