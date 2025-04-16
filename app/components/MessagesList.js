import React from 'react'

const MessagesList = ({ messages, index }) => {
    // console.log("sdasdasd",messages)
    index = index + 1
    return (
        <tr className=" hover:bg-gray-50 transition duration-300 border-b">
            <td className="px-6 py-4 font-medium text-gray-900">{index}</td>
            <td className="px-6 py-4 font-medium text-gray-900">  {new Date(messages.sendAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })}</td>
            <td className="px-6 py-4 font-medium text-gray-900">{messages.status}</td>
            <td className="px-6 py-4 font-medium text-gray-900">{messages.body}</td>
            <td className="px-6 py-4 font-medium text-gray-900"><button>Delete</button></td>

        </tr>
    )
}

export default MessagesList
