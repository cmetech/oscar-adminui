import axios from 'axios';
import https from 'https';
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
    const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/${workflow_id}`, req.body, {
      timeout: 30000,
      httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response?.data) {
      res.status(response.status || 200).json(response.data);
    } else {
      res.status(response.status).json({ message: 'No response - An error occurred' });
    }
  } catch (error) {
    console.error('Error triggering workflow:', error.response?.data || error.message);
    
    // If the error has a response, send that status code, otherwise send 500
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.detail || 'An error occurred while triggering the workflow';
    
    return res.status(statusCode).json({ error: errorMessage });
  }
}