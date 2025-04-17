"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  const [editedClient, setEditedClient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [originalClients, setOriginalClients] = useState([]);
  const [formErrors, setFormErrors] = useState({});


  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {
      getData();
    }
  }, [session, router]);

  const getData = useCallback(async () => {
    const userId = sessionStorage.getItem("id");
    if (!userId) return;
    try {
      const clientData = await fetchclient(userId, "active");
      // console.log("all clients",clientData)
      if (clientData) {
        setClients(clientData);
        setOriginalClients(clientData); // Store the original clients data
      };
      if (clientData.error) {
        setClients([]);
      }

    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }, []);

  const handleOpenEditModal = (client) => {

    setEditedClient({ ...client });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);

    setEditedClient(null);
  };

  const handleOpenAddClientModal = () => setIsAddClientOpen(true);
  const handleCloseAddClientModal = () => setIsAddClientOpen(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const phoneNumber = value.replace(/\D/g, ""); // Remove non-digit characters
      setEditedClient({ ...editedClient, [name]: phoneNumber });
      return;
    }
    setEditedClient({ ...editedClient, [e.target.name]: e.target.value });
  };


  const validateClient = () => {
    const errors = {};

    if (!editedClient.name || editedClient.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters.";
    }

    if (!editedClient.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedClient.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!editedClient.phone || editedClient.phone.length !== 10) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }

    return errors;
  };

  const handleUpdateClient = async () => {
    if (!editedClient) return;

    const errors = validateClient();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

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


  const onChangeHandle = async (e) => {
    const searchTerm = e.target.value.trim();

    if (!searchTerm) {
      await getData();
      return;
    }


    try {
      const searchData = [...originalClients].filter((client) => {
        const nameMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = client.email.toLowerCase().includes(searchTerm.toLowerCase());
        const phoneMatch = client.phone.includes(searchTerm);
        return nameMatch || emailMatch || phoneMatch;
      });
      setClients(searchData);


    } catch (error) {
      console.error("Error searching clients:", error);
    }
  }

  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedClient = (Array.isArray(clients) ? clients : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(clients) ? clients.length : 0) / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container max-w-6xl mx-auto  p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          onChange={onChangeHandle}
          placeholder="Search clients..."
          className="w-full sm:w-2/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleOpenAddClientModal}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-80 text-white font-semibold rounded-lg text-sm px-6 py-3 shadow-lg transition-all"
        >
          + Add Client
        </button>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> */}
      <hr />
      <div className="w-full overflow-x-auto min-h-[68vh] shadow-md rounded-lg">
        {clients.length > 0 ? (
          <table className="w-full border-collapse min-w-[600px] text-left">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
              <tr>
                <th className="px-6 py-3 border-b">Name</th>
                <th className="px-6 py-3 border-b">Email</th>
                <th className="px-6 py-3 border-b">Contact</th>
                <th className="px-6 py-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {paginatedClient.map((client) => (
                <ClientList key={client._id} client={client} getData={getData} updateClient={handleOpenEditModal} />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center w-full py-4">No clients found.</p>
        )}
      </div>


      {/* pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum + 1)}
            className={`px-3 py-1 rounded ${currentPage === pageNum + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {pageNum + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>



      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-semibold text-gray-900">Add New Client</h3>
            <Addclient onClose={handleCloseAddClientModal} getData={getData} />

          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center transform-content  z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6  animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-900">Edit Client</h3>
            {editedClient ? (
              <form className="space-y-3">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={editedClient.name}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Name"
                    required
                  />
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    value={editedClient.email}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Email"
                  />
                  {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    name="phone"
                    value={editedClient.phone}
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/\D/g, "");
                      if (phoneNumber.length <= 10) {
                        setEditedClient({ ...editedClient, phone: phoneNumber });
                      }
                    }}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Phone"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
                </div>

                <textarea
                  name="address"
                  value={editedClient.address}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Address"
                  required
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
