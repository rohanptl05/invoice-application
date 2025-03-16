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
    <div className='w-full bg-blue-300 p-2.5 border-4 m-2 rounded-b-2xl flex justify-between'>

      <div className='flex'>
        <Link href={`/dashboard/clients/${client._id}/invoices`}>
          <p>{client.name}</p>
          <p>{client.email}</p>
        </Link>

      </div>

      <div className='flex'>
        <button
          onClick={() => updateClient(client)}
          className='bg-blue-700 p-2 m-1 rounded-2xl flex text-white'
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className='bg-red-600 p-2 m-1 rounded-2xl flex text-white'
        >
          Delete
        </button>
      </div>

    </div>
  );
};

export default ClientList;
