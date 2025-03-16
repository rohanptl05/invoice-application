"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { fetchclient, updateClient } from '@/app/api/actions/clientactions';
import ClientList from '@/app/components/ClientList';
import Addclient from '@/app/components/Addclient';
// import Invoices from '@/app/components/Invoices';

const Page = () => {
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editedClient, setEditedClient] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {
      getData();
    }
  }, [session]);

  const getData = async () => {
    const userId = sessionStorage.getItem("id");
    if (!userId) {
      console.error("User ID not found in sessionStorage");
      return;
    }

    try {
      const userData = await fetchclient(userId);
      if (userData) {
        setClients(userData);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleOpenEditModal = (client) => {
    setSelectedClient(client);
    setEditedClient({ ...client });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClient(null);
    setEditedClient(null);
  };

  const handleOpenAddClientModal = () => {
    setIsAddClientOpen(true);
  };

  const handleCloseAddClientModal = () => {
    setIsAddClientOpen(false);
  };

  const handleEditChange = (e) => {
    setEditedClient({ ...editedClient, [e.target.name]: e.target.value });
  };

  const handleUpdateClient = async () => {
    if (!editedClient) return;

    try {
      const response = await updateClient(editedClient, editedClient._id);
      if (response.success) {
        getData();
        handleCloseEditModal();
        alert("Client updated successfully!");
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  return (
    <>
      <div>Search bar</div>

      <div>
        <button className="bg-amber-500 p-2 text-white rounded" onClick={handleOpenAddClientModal}>
          + Add client
        </button>
      </div>

      <div className="w-[85%]">
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientList key={client._id} client={client} updateClient={handleOpenEditModal} getData={getData} />
          ))
        ) : (
          <p>No clients found.</p>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900">Add New Client</h3>
            <Addclient onClose={handleCloseAddClientModal} getData={getData} />
            <button
              onClick={handleCloseAddClientModal}
              className="mt-4 bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Client</h3>

            {editedClient ? (
              <form>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editedClient.name}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg"
                />

                <label className="block text-sm font-medium text-gray-700 mt-3">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedClient.email}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg"
                />

                <label className="block text-sm font-medium text-gray-700 mt-3">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editedClient.phone}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg"
                />
              </form>
            ) : (
              <p className="text-gray-500">Loading client details...</p>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={handleUpdateClient} className="text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg">
                Save Changes
              </button>
              <button onClick={handleCloseEditModal} className="ml-3 bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
