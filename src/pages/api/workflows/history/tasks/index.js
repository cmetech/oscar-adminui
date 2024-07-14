import axios from 'axios';
import https from 'https';
import oscarConfig from 'src/configs/oscarConfig';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { workflow_id, workflow_run_id, ...query } = req.query;

    try {
      const response = await axios.get(
        `${oscarConfig.MIDDLEWARE_API_URL}/workflows/${workflow_id}/history/${workflow_run_id}/tasks`,
        {
          params: query,
          timeout: 30000,
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        }
      );

      if (response?.data) {
        res.status(200).json(response.data);
      } else {
        res.status(500).json({ message: 'No response - An error occurred' });
      }
    } catch (error) {
      console.error('Error fetching task instances:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}