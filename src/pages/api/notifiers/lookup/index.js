// pages/api/notifiers/lookup.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { identifier, by_name = 'false' } = req.query

    if (!identifier) {
      return res.status(400).json({ message: 'Identifier (name or UUID) is required' })
    }

    try {
      // Construct the request URL with query parameters
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/notifiers/${identifier}`)
      url.searchParams.append('by_name', by_name)

      const response = await axios.get(url.toString(), {
        timeout: 30000,
        headers: {
          'X-API-Key': oscarConfig.API_KEY,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(response.status || 200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error looking up notifier:', error)
      // Return empty object for 404s
      if (error.response?.status === 404) {
        return res.status(200).json({})
      }
      // Handle other errors as before
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || error.message
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
