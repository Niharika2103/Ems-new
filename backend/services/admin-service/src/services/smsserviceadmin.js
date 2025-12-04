// import axios from "axios";

// export const sendSMS = async (number, message) => {
//   try {
//     if (!number) return;

//     const cleaned = number.replace(/\s+/g, ""); // remove spaces

//     const data = {
//       route: "v3",
//       sender_id: "TXTIND",
//       message: message,
//       language: "english",
//       numbers: cleaned
//     };

//     await axios.post("https://www.fast2sms.com/dev/bulkV2", data, {
//       headers: {
//         authorization: process.env.FAST2SMS_API_KEY,
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("📲 SMS sent to:", cleaned);

//   } catch (err) {
//     console.error("❌ SMS error:", err.response?.data || err.message);
//   }
// };
