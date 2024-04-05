// pages/api/tasks/register/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post(
        `${oscarConfig.MIDDLEWARE_API_URL}/tasks/register`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        }
      )

      // Forward the successful response from the middleware to the client
      return res.status(200).json(response.data)
    } catch (error) {
      console.error('Error registering tasks:', error)

      return res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
