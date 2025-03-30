import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { deleteClient } from '../api/actions/clientactions';
// import Invoices from './Invoices';

const ClientList = ({ client, updateClient, getData }) => {
  const { data: session } = useSession();
  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {

      getData();
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
    <div className="w-full bg-blue-300 p-4 border-1 m-2 rounded-2xl flex flex-col sm:flex-row justify-between items-center">
  {/* Client Info */}
  <div className="flex flex-col sm:flex-row sm:items-center">
    <Link href={`/dashboard/clients/${client._id}/invoices`} className="">
      <p className="text-lg font-semibold text-gray-900">{client.name}</p>
      <p className="text-sm text-gray-700">{client.phone}</p>
    </Link>
  </div>

  {/* Action Buttons */}
  <div className="flex mt-2 sm:mt-0">
    <button
      onClick={() => updateClient(client)}
      className="bg-blue-700 p-2 px-4 rounded-xl text-white hover:bg-blue-800 transition duration-300 shadow-md"
    >
      Edit
    </button>
    <button
      onClick={handleDelete}
      className="bg-red-600 p-2 px-4 ml-2 rounded-xl text-white hover:bg-red-700 transition duration-300 shadow-md"
    >
      Delete
    </button>
  </div>
</div>

  );
};

export default ClientList;
