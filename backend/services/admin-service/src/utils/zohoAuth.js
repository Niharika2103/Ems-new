import axios from "axios";

export async function getZohoAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append("refresh_token", process.env.ZOHO_REFRESH_TOKEN);
    params.append("client_id", process.env.ZOHO_CLIENT_ID);
    params.append("client_secret", process.env.ZOHO_CLIENT_SECRET);
    params.append("grant_type", "refresh_token");

    const { data } = await axios.post(
      "https://accounts.zoho.in/oauth/v2/token",  // IMPORTANT: .in DC
      params
    );

    return data.access_token;
  } catch (err) {
    console.error("Error getting Zoho Access Token:", err.response?.data || err);
    throw new Error("Could not generate Zoho access token");
  }
}
