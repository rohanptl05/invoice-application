import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { deleteClient } from '../api/actions/clientactions';
// import Invoices from './Invoices';

const ClientList = ({ client, updateClient ,getData}) => {
  const { data: session } = useSession();
  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {

      // getData();
    }
  }, [deleteClient]);
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      const response = await deleteClient(client._id);
      if (response.success) {
        getData();  // 🔥 Refresh the data after deletion
      } else {
        console.error("Error deleting client:", response.error);
      }
    }
  };
  return (
    <tr className=" hover:bg-gray-50 transition text-left duration-300 border-b">
    {/* Client Info */}
    <td className="px-6 py-4 font-medium text-gray-900">
      <Link href={`/dashboard/clients/${client._id}/invoices`} className="hover:text-blue-600">
        {client.name}
      </Link>
    </td>
    <td className="px-6 py-4 text-gray-700">{client.email}</td>
    <td className="px-6 py-4 text-gray-700">{client.phone}</td>
    {/* Action Buttons */}
    <td className="px-6 py-4 flex justify-center space-x-2">
      <button
        onClick={() => updateClient(client)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
      >
        Delete
      </button>
    </td>
  </tr>
  
  
  );
};

export default ClientList;
