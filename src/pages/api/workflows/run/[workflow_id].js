import axios from 'axios';
import { getSession } from 'next-auth/react';
import oscarConfig from 'src/configs/oscarConfig';

export default async function handler(req, res) {
  const { workflow_id } = req.query;

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Make a request to the middleware
    const response = await axios.post(
      `${oscarConfig.MIDDLEWARE_API_URL}/workflows/${workflow_id}`,
      req.body, // Pass any additional data from the request body
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the response from the middleware
    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Error triggering workflow:', error.response?.data || error.message);
    
    // If the error has a response, send that status code, otherwise send 500
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.detail || 'An error occurred while triggering the workflow';
    
    return res.status(statusCode).json({ error: errorMessage });
  }
}