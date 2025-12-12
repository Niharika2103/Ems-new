import axios from "axios";
import { getZohoAccessToken } from "../utils/zohoAuth.js";

// const BASE_URL = "https://www.zohoapis.in/invoice/api/v3";  // .in DC
const BASE_URL = "https://www.zohoapis.in/books/v3"; // CORRECT URL


export async function createZohoInvoice(invoicePayload) {
  const accessToken = await getZohoAccessToken();

 const response = await axios.post(
  `${BASE_URL}/invoices`,
  invoicePayload,
  {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "X-com-zoho-books-organizationid": process.env.ZOHO_ORG_ID,
    },
  }
);


  return response.data;
}


export async function getZohoInvoice(invoiceId) {
  const accessToken = await getZohoAccessToken();

  const response = await axios.get(
    `${BASE_URL}/invoices/${invoiceId}`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "X-com-zoho-books-organizationid": process.env.ZOHO_ORG_ID,
      },
    }
  );

  return response.data;
}

export async function createZohoCustomer(customerPayload) {
  const accessToken = await getZohoAccessToken();

  const response = await axios.post(
    `${CUSTOMER_BASE_URL}/contacts`,
    customerPayload,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "X-com-zoho-books-organizationid": process.env.ZOHO_ORG_ID
      }
    }
  );

  return response.data;
}




