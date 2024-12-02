import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const url = `${oscarConfig.MIDDLEWARE_API_URL}/alerts/rules/reload`
      await axios.post(
        url,
        {},
        {
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        }
      )
      res.status(200).json({ message: 'Alert rules reloaded successfully' })
    } catch (error) {
      console.error('Error reloading alert rules:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
