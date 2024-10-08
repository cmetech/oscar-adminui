import axios from 'axios';
import https from 'https';
import oscarConfig from 'src/configs/oscarConfig';

async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const data = req.body;

            const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/metricstore/query`, data, {
                headers: {
                    'Content-Type': 'application/json'
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
            });

            console.log(`Request sent to: ${oscarConfig.MIDDLEWARE_API_URL}/metricstore/query`);
      
            // Respond with the data returned from the middleware backend
            res.status(response.status || 200).json(response.data);
        } catch (error) {
            console.error('Error in API route:', error);

            const status = error.response?.status || 500;
            const message = error.response?.data?.message || error.message;

            res.status(status).json({ message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default handler;
