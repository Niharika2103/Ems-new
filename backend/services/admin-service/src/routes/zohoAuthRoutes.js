import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/call/back", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("No code received from Zoho.");
  }

  try {
    const tokenResponse = await axios.post(
      "https://accounts.zoho.in/oauth/v2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          redirect_uri: process.env.ZOHO_REDIRECT_URI,
          code: code,
        },
      }
    );

    const { refresh_token } = tokenResponse.data;

    return res.send(`
      <h2>Zoho Connected Successfully 🎉</h2>
      <p><b>Refresh Token:</b> ${refresh_token}</p>
      <p>Add this in .env → ZOHO_REFRESH_TOKEN</p>
    `);
  } catch (err) {
    console.error("Zoho Token Error:", err.response?.data || err.message);
    return res.status(500).send("Token exchange failed.");
  }
});

export default router;
