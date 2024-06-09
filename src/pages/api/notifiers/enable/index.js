// pages/api/notifiers/enable.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const notifierIds = req.body

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/notifiers/enable`, notifierIds, {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      return res.status(response.status || 200).json({
        message: response.data.message,
        notifier_ids: response.data.notifier_ids
      })
    } catch (error) {
      console.error('Error enabling notifiers:', error)

      return res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
