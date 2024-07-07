/*
import { authOptions } from "../[...nextauth]";
import nextAuth, { getServerSession } from "next-auth"
import { getIdToken } from "src/lib/utils";


export async function GET() {
    const session = await getServerSession(authOptions);
  
    console.log("Rupesh in *** GET *** function")
    console.log("Rupesh in *** GET *** function Session = %s", session)
    if (session) {
  
      const idToken = await getIdToken();
  
      // this will log out the user on Keycloak side
      var url = `${process.env.END_SESSION_URL}?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL)}`;
  
      try {
        console.log("Rupesh in GET function about to call with idToken = %s",idToken)
        console.log("Rupesh in GET function about to call\n %s",url)
        const resp = await fetch(url, { method: "GET" });
      } catch (err) {
        console.error(err);
        return new Response({ status: 500 });
      }
    }
    return new Response({ status: 200 });
  }*/

import { authOptions } from "../[...nextauth]";
import { getServerSession } from "next-auth";
import { getIdToken } from "src/lib/utils";
/*
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    console.log("Rupesh in *** GET *** function");
    console.log("Rupesh in *** GET *** function Session = %s", session);
    if (session) {
      const idToken = await getIdToken(req, res);

      // this will log out the user on Keycloak side
      const url = `${process.env.END_SESSION_URL}?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL)}`;

      try {
        console.log("Rupesh in GET function about to call with idToken = %s", idToken);
        console.log("Rupesh in GET function about to call URL\n %s", url);
        console.log("Rupesh in GET function about to call URL\n %d", url.length);
        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
          console.error('Logout request failed with status:', response.status);
          return res.status(500).json({ error: 'Logout request failed' });
        }
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      console.log('No session found');
      return res.status(401).json({ error: 'No session found' });
    }

    return res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Error during logout request:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
*/

export default async function handler(req, res) {
    if (req.method !== "GET") {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  
    try {
      // Add logging to debug the incoming request
      console.log("Incoming request headers:", req.headers);
      console.log("Incoming request body:", req.body);
  
      // Get the session
      const session = await getServerSession(req, res, authOptions);
  
      // Check if session is null
      if (!session) {
        console.log("No session found");
        return res.status(401).json({ error: 'Not authenticated' });
      }
  
      // Log session details
      console.log("Session details:", session);
  
      // Get ID token
      const idToken = await getIdToken(session);
  
      // Check if idToken is null or undefined
      if (!idToken) {
        console.log("No ID token found");
        return res.status(401).json({ error: 'No ID token found' });
      }

      const accessToken = session.access_token;
      const refreshToken = session.refresh_token; // Assuming you have the refresh token stored in the session
      const clientId = process.env.KEYCLOAK_CLIENT_ID;
      const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

      console.log("Rupesh access Token:", accessToken);
      console.log("Rupesh refresh Token:", refreshToken);
  
      // Log ID token
      console.log("ID Token:", idToken);
  
      const postLogoutRedirectUri = encodeURIComponent(process.env.POST_LOGOUT_REDIRECT_URI);
      const url = `${process.env.END_SESSION_URL}`;
  
      // Prepare the body for POST request
      const body = new URLSearchParams({
        id_token_hint: idToken,
        post_logout_redirect_uri: postLogoutRedirectUri,
      });
  
      // Log request details
      console.log("Rupesh Making POST request to Keycloak logout endpoint");
      console.log("POST request URL:", url);
      console.log("POST request body:", body.toString());
  
      // Make the POST request to Keycloak logout endpoint
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          //body: body.toString(),
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            post_logout_redirect_uri: "http://127.0.0.1:4100/"
          })
        });
  
        // Log response details
        const responseText = await response.text();
        console.log("Logout response status:", response.status);
        console.log("Logout response text:", responseText);
  
        // Check if response is not ok
        if (!response.ok) {
          console.error('Logout request failed with status:', response.status);
          return res.status(500).json({ error: 'Logout request failed', details: responseText });
        }
  
        // Successful logout
        res.status(200).json({ message: 'Logout successful' });
      } catch (err) {
        console.error('Error during logout request:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (err) {
      console.error('Error during logout request:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

/*
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  
    try {
      const session = await getServerSession(req, res, authOptions);
  
      console.log("Rupesh in *** POST *** function");
      console.log("Rupesh in *** POST *** function Session = %s", session);
      if (session) {
        const idToken = await getIdToken(req, res);
  
        // this will log out the user on Keycloak side
        const url = `${process.env.END_SESSION_URL}`;
        const body = new URLSearchParams({
          id_token_hint: idToken,
          post_logout_redirect_uri: process.env.NEXTAUTH_URL,
        });
  
        try {
          console.log("Rupesh in POST function about to call with idToken = %s", idToken);
          console.log("Rupesh in POST function about to call URL\n %s", url);
  
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
          });
  
          if (!response.ok) {
            console.error('Logout request failed with status:', response.status);
            return res.status(500).json({ error: 'Logout request failed' });
          }
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        console.log('No session found');
        return res.status(401).json({ error: 'No session found' });
      }
  
      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      console.error('Error during logout request:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  */