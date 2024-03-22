// pages/api/tasks/config/[taskName].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { taskName } = req.query

  if (req.method === 'POST') {
    // const payload = req.body
    const payload = {}

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/register/${taskName}`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY, // Ensure this key exists in your oscarConfig
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(200).json({
          message: 'Task registeration successful for ' + taskName
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error with task registeration for ${taskName}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
