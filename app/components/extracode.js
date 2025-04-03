"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchclient, updateClient, fetchSearchClient } from "@/app/api/actions/clientactions";
import ClientList from "@/app/components/ClientList";
import Addclient from "@/app/components/Addclient";

const Page = () => {
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 5; // Number of clients per page
  const [searchTerm, setSearchTerm] = useState("");

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
      const userData = await fetchclient(userId);
      setClients(userData || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }, []);

  const handleSearch = async (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);
    if (!term) {
      await getData();
      return;
    }
    try {
      const userId = sessionStorage.getItem("id");
      const searchData = await fetchSearchClient(userId, term);
      setClients(searchData.clients || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching clients:", error);
    }
  };

  // Pagination Logic
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = useMemo(() => clients.slice(indexOfFirstClient, indexOfLastClient), [clients, currentPage]);

  const totalPages = Math.ceil(clients.length / clientsPerPage);

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          onChange={handleSearch}
          value={searchTerm}
          placeholder="Search clients..."
          className="w-full sm:w-2/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => setIsAddClientOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-80 text-white font-semibold rounded-lg text-sm px-6 py-3 shadow-lg transition-all"
        >
          + Add Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="w-full overflow-x-auto shadow-md rounded-lg">
        {clients.length > 0 ? (
          <table className="w-full border-collapse min-w-[600px] text-left">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
              <tr>
                <th className="px-6 py-3 border-b">Name</th>
                <th className="px-6 py-3 border-b">Email</th>
                <th className="px-6 py-3 border-b">Contact</th>
                <th className="px-6 py-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentClients.map((client) => (
                <ClientList key={client._id} client={client} getData={getData} />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center w-full py-4">No clients found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4 bg">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
