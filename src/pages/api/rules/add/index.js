// oscar-adminui/src/pages/api/rules/add/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'POST') {
    const payload = {
      ...req.body,
      suppression_window_ids: req.body.suppression_window_ids || []
    }

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/rules`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(response.status || 201).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error creating rule:`, error)
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.detail || error.message
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
