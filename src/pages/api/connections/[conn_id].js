import axios from 'axios';
import https from 'https';
import oscarConfig from 'src/configs/oscarConfig';

async function handler(req, res) {
  const { conn_id } = req.query;

  if (req.method === 'GET') {
    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/connections/${conn_id}`, {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      });

      if (response?.data) {
        res.status(response.status || 200).json(response.data);
      } else {
        res.status(500).json({ message: 'No response - An error occurred' });
      }
    } catch (error) {
      console.error('Error fetching connection:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const response = await axios.delete(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/connections/${conn_id}`, {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      });

      res.status(response.status || 204).end();
    } catch (error) {
      console.error('Error deleting connection:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const formattedBody = {
        connection_id: req.body.name, // Rename 'name' to 'connection_id'
        conn_type: req.body.type, // Rename 'type' to 'conn_type'
        description: req.body.description || null,
        host: req.body.host || null,
        login: req.body.login || null,
        schema: req.body.schema || null,
        port: req.body.port ? parseInt(req.body.port, 10) : null,
        password: req.body.password,
        extra: req.body.extra || null
      };

      // If extra is a valid JSON string, we keep it as is. If it's an object, we stringify it.
      if (formattedBody.extra && typeof formattedBody.extra === 'object') {
        formattedBody.extra = JSON.stringify(formattedBody.extra).replace(/"/g, "'");
      }

      const response = await axios.put(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/connections/${conn_id}`, formattedBody, {
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
      console.error('Error updating connection:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/connections/${conn_id}/test`, req.body, {
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
      console.error('Error testing connection:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE', 'PUT', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;