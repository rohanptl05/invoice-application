"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchclient, updateClient } from "@/app/api/actions/clientactions";
import ClientList from "@/app/components/ClientList";
import Addclient from "@/app/components/Addclient";

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
    if (!userId) return;
    try {
      const userData = await fetchclient(userId);
      setClients(userData || []);
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

  const handleOpenAddClientModal = () => setIsAddClientOpen(true);
  const handleCloseAddClientModal = () => setIsAddClientOpen(false);
  
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
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search clients..."
          className="w-full max-w-md px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleOpenAddClientModal}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-80 text-white font-semibold rounded-lg text-sm px-6 py-3 shadow-lg transition-all"
        >
          + Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientList key={client._id} client={client} updateClient={handleOpenEditModal} getData={getData} />
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">No clients found.</p>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
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
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-900">Edit Client</h3>
            {editedClient ? (
              <form className="space-y-3">
                <input
                  type="text"
                  name="name"
                  value={editedClient.name}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Name"
                />
                <input
                  type="email"
                  name="email"
                  value={editedClient.email}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Email"
                />
                <input
                  type="text"
                  name="phone"
                  value={editedClient.phone}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Phone"
                />
              </form>
            ) : (
              <p className="text-gray-500">Loading client details...</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleUpdateClient}
                className="text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg"
              >
                Save Changes
              </button>
              <button
                onClick={handleCloseEditModal}
                className="ml-3 bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
