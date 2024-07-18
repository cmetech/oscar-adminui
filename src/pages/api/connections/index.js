import axios from 'axios';
import https from 'https';
import oscarConfig from 'src/configs/oscarConfig';

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query;
    const { limit = '100', offset = '0', order_by = '' } = query;

    const queryStringParameters = {
      limit: limit,
      offset: offset,
      order_by: order_by
    };

    try {
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/connections`);
      Object.entries(queryStringParameters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });

      const response = await axios.get(url.toString(), {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      });

      if (response?.data) {
        res.status(response.status || 200).json(response.data);
      } else {
        res.status(500).json({ message: 'No response - An error occurred' });
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/connections`, req.body, {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response?.data) {
        res.status(response.status || 201).json(response.data);
      } else {
        res.status(500).json({ message: 'No response - An error occurred' });
      }
    } catch (error) {
      console.error('Error creating connection:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;