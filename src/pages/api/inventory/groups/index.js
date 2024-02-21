// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import oscarConfig from '../../../../configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_INVENTORY_API_URL}/groups`, {
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        // console.log('export targets', response?.data)
        res.status(200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error proxying export targets:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  }
}

export default handler
