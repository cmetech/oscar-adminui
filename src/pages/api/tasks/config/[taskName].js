// pages/api/tasks/config/[taskName].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { taskName } = req.query

  if (req.method === 'GET') {
    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/config/${taskName}`, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY,
          accept: 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error fetching task configuration for ${taskName}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'POST') {
    const payload = req.body

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/config/${taskName}`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY, // Ensure this key exists in your oscarConfig
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error updating task configuration for ${taskName}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
