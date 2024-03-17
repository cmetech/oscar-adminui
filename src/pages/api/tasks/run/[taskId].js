// pages/api/tasks/run/[taskId].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { taskId } = req.query

  if (req.method === 'POST') {
    const prompts = req.body || {}

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/run/${taskId}`, prompts, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY, // Ensure you have this in your oscarConfig or fetch it from a secure place
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        // console.log('export targets', response?.data)
        res.status(200).json({
          data: response.data
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error running task ${taskId}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
