import axios from 'axios';
import https from 'https';
import oscarConfig from 'src/configs/oscarConfig';

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/history`, req.body, {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response?.data) {
        res.status(response.status || 200).json(response.data);
      } else {
        res.status(500).json({ message: 'No response - An error occurred' });
      }
    } catch (error) {
      console.error('Error listing workflow history:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;