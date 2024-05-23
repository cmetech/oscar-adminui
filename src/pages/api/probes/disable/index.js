// pages/api/probes/disable.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const probeIds = req.body // Assuming the body contains an array of probe IDs

    try {
      const response = await axios.post(
        `${oscarConfig.MIDDLEWARE_API_URL}/metricstore/probes/disable`,
        probeIds, // Forward the array of probe IDs to the middleware
        {
          headers: { 'Content-Type': 'application/json' },
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        }
      )

      // Forward the successful response from the middleware to the client
      return res.status(response.status || 200).json({
        message: response.data.message,
        probeids: response.data.probeids
      })
    } catch (error) {
      console.error('Error disabling probes:', error)

      return res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
