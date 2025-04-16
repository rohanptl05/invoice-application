
// const twilio = require("twilio");

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);


// plan
// client.messages
//   .create({
//     body: 'hii Rohan  😄',
//     messagingServiceSid: "MGd843fbfcac0d75e069703fa356cb533b", // Your messaging service SID
//     to: '+918511229451'
//   })
//   .then(message => console.log('✅ Message SID:', message.sid))
//   .catch(err => console.error('❌ Error:', err.message));


// schedule
// async function createMessage() {
//   const message = await client.messages.create({
//     body: "Sui ja ghant",
//     messagingServiceSid: "MGd843fbfcac0d75e069703fa356cb533b",
//     scheduleType: "fixed",
//     sendAt: new Date("2025-04-16 11:02:27"),
//     to: "+918511229451",
//   });

//   console.log(message.body);
// }

// createMessage();


// app/api/sendScheduledMessages/route.js