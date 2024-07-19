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
      console.log('Incoming request body:', req.body);

      // Format the data before sending to the middleware
      const formattedBody = {
        connection_id: req.body.name, // Rename 'name' to 'connection_id'
        conn_type: req.body.type, // Rename 'type' to 'conn_type'
        description: req.body.description || null,
        host: req.body.host || null,
        login: req.body.login || null,
        schema: req.body.schema || null,
        port: req.body.port ? parseInt(req.body.port, 10) : null, // Convert port to integer or null
        password: req.body.password,
        extra: req.body.extra || null // Keep extra as a string
      };

      // If extra is a valid JSON string, we keep it as is. If it's an object, we stringify it.
      if (formattedBody.extra && typeof formattedBody.extra === 'object') {
        formattedBody.extra = JSON.stringify(formattedBody.extra).replace(/"/g, "'");
      }

      console.log('Formatted request body:', formattedBody);

      const url = `${oscarConfig.MIDDLEWARE_API_URL}/workflows/connections`;
      console.log('Posting to URL:', url);

      // Stringify the entire body to ensure proper JSON formatting
      const jsonBody = JSON.stringify(formattedBody);
      console.log('JSON body being sent:', jsonBody);

      const response = await axios.post(url, jsonBody, {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response?.data) {
        console.log('Successful response:', response.data);
        res.status(response.status || 201).json(response.data);
      } else {
        console.error('No response data received');
        res.status(500).json({ message: 'No response - An error occurred' });
      }
    } catch (error) {
      console.error('Error creating connection:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      res.status(error.response?.status || 500).json({ 
        message: error.message,
        details: error.response?.data || 'No additional details available'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;