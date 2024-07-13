import axios from 'axios';
import https from 'https';
import oscarConfig from 'src/configs/oscarConfig';

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query;
    const { limit = '100', page = '0', order_by = '' } = query;

    const itemsPerPage = parseInt(limit, 10);
    const pageNumber = parseInt(page, 10);
    const offset = itemsPerPage * pageNumber;

    const queryStringParameters = {
      limit: limit,
      offset: offset,
      order_by: order_by
    };

    try {
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/workflows`);
      Object.entries(queryStringParameters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });

      const response = await axios.get(url.toString(), {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      });

      if (response?.status === 200 && response.data) {
        res.status(200).json(response.data);
      } else {
        res.status(500).json({ total_entries: 0, dags: [] });
      }
    } catch (error) {
      console.error('Error fetching DAGs:', error);
      res.status(500).json({ total_entries: 0, dags: [] });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;