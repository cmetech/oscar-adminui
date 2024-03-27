// pages/api/tasks/query.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'POST') {
    const { taskName } = req.query // Extract task name from query params

    // Prepare task names array
    const taskNames = [taskName]

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/query`, taskNames, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY, // Ensure this key exists in your oscarConfig
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        // Success response from middleware
        res.status(200).json(response.data)
      } else {
        // No response data received
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error querying tasks:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    // Method not allowed response for non-POST requests
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
