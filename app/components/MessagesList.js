import React from 'react'
import { DeleteMassege } from '../api/actions/messagesactions';

const MessagesList = ({ messages, index, getData, total }) => {
    // console.log("sdasdasd",messages)
    const handleDeleteMessage = async () => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            const response = await DeleteMassege(messages._id);
            if (response.success) {
                alert("Message deleted successfully!");
                // After deleting, trigger data refresh
                await getData();
            } else {
                alert("Failed to delete message.");
            }
        }
    }
    const reverseIndex = total - index; 
    return (
        <tr className=" hover:bg-gray-50 transition duration-300 border-b">
            <td className="px-6 py-4 font-medium text-gray-900">{reverseIndex}</td>
            <td className="px-6 py-4 font-medium text-gray-900">  {new Date(messages.sendAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })}</td>
            <td className="px-6 py-4 font-medium text-gray-900">{messages.status}</td>
            <td className="px-6 py-4 font-medium text-gray-900" title={messages.body}>
                {messages.body.length > 25
                    ? `${messages.body.slice(0, 25)}...`
                    : messages.body}
            </td>
            <td className="px-6 py-4 font-medium text-gray-900"> <button onClick={handleDeleteMessage} className="text-white bg-red-500 hover:bg-red-600 font-medium rounded-lg text-sm px-2 py-1">Delete</button>
            </td>

        </tr>
    )
}

export default MessagesList
