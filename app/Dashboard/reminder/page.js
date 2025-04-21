'use client';
import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal'
import { Addmessages, fetchMessages } from '@/app/api/actions/messagesactions';
import MessagesList from '@/app/components/MessagesList';
import { useSession } from 'next-auth/react';
import { Router } from 'next/router';

const Page = () => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([])
  const [formData, setFormData] = useState({
    user: '',
    to: '+918511229451',
    body: '',
    sendAt: '',
  });
  const [currentPage, setCurrentPage] = useState(1);


  const userId = sessionStorage.getItem("id")
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem("id");
    const newFormData = { ...formData, user: userId };


    // console.log("schedule time:",formData)
    const res = await Addmessages(newFormData);
    if (res) {
      alert("Added Reminder Messages")
      setShowModal(false)
      setFormData({ to: '', body: '', sendAt: '' });
      getData();
    }

  };

  const getData = async () => {
    const userId = sessionStorage.getItem("id");
    if (userId) {

      const response = await fetchMessages(userId);
      if (response) {
        setMessages(response);
      }
    }
  }

  useEffect(() => {
    getData();
  }, [session]);




  // Pagination Logic
  const messagesPerPage = 5; // Customize as needed

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);

  const totalPages = Math.ceil(messages.length / messagesPerPage);



  return (
    <>
      <div className="container p-3">
        <div className="flex justify-between items-center bg-blue-100 p-4 rounded-xl">
          <h2 className="text-xl font-bold text-blue-700">Reminder Notes</h2>
          <button
            onClick={() => setShowModal(true)}
            type="button"
            className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            📤 Schedule SMS
          </button>
        </div>

        {/* Modal Form */}
        {showModal && (
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="📤 Schedule SMS">
            <form onSubmit={handleSubmit} className="space-y-4 w-[90%]">
              <div>
                <label className="block text-sm font-semibold mb-1">📱 Phone Number</label>
                <input
                  type="number"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  required
                  placeholder="+91xxxxxxxxxx"
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">📝 Message</label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">⏰ Schedule Time</label>
                <input
                  type="datetime-local"
                  name="sendAt"
                  value={formData.sendAt}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Schedule Message
              </button>
            </form>
          </Modal>
          // <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="SMS Notes">

          //   <p>Roahn</p>
          // </Modal>
        )}
        <div>
          {/* Reminder SMS */}
          {messages && messages.length > 0 ? (
            <>
              <h2 className="text-xl font-bold mb-3 text-gray-700">Reminder SMS</h2>
              <div className="w-full overflow-x-auto mt-2 h-[67vh] shadow-md rounded-lg">
                <table className="w-full border-collapse min-w-[600px] text-center">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
                    <tr>
                      <th className="px-6 py-3 border-b">Index #</th>
                      <th className="px-6 py-3 border-b">Scheduling Date</th>
                      <th className="px-6 py-3 border-b">Status</th>
                      <th className="px-6 py-3 border-b">Message</th>
                      <th className="px-6 py-3 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMessages.map((message, index) => (
                      <MessagesList key={index} messages={message}   total={messages.length} index={indexOfFirstMessage + index} getData={getData} />
                    ))}

                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-500 mt-4">No scheduled messages found.</p>
          )}
        </div>


        {/* //pagination */}
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



      </div>
    </>
  );
};

export default Page;
