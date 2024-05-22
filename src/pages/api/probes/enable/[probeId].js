// pages/api/probes/disable/[probeId].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { validateUUID } from 'src/lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { probeId } = req.query

  if (!probeId || !validateUUID(probeId)) {
    return res.status(400).json({ message: "Invalid or missing 'probeId'. A valid UUID is required." })
  }

  const apiToken = req.headers.authorization

  const httpsAgent = new https.Agent({
    rejectUnauthorized: oscarConfig.SSL_VERIFY
  })

  try {
    const response = await axios.post(
      `${oscarConfig.MIDDLEWARE_API_URL}/metricstore/probes/enable`,
      [probeId], // Forward the array of probe IDs to the middleware
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      }
    )

    // Forward the successful response from the middleware to the client
    return res.status(200).json(response.data)
  } catch (error) {
    console.error('Error disabling probes:', error)

    return res.status(error.response?.status || 500).json({ message: error.message })
  }
}
