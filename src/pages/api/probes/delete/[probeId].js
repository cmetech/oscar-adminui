// pages/api/probes/delete/[probeId].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { validateUUID } from 'src/lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { probeId } = req.query // Extract the task ID from the request URL

  // Check if taskId is undefined or not a valid UUID
  if (!probeId || !validateUUID(probeId)) {
    return res.status(400).json({ message: "Invalid or missing 'probeId'. A valid UUID is required." })
  }

  const apiToken = req.headers.authorization // Assume the apiToken is passed in the request headers

  // Create an instance of https.Agent for the request to bypass SSL certificate errors
  const httpsAgent = new https.Agent({
    rejectUnauthorized: oscarConfig.SSL_VERIFY // Make sure this is aligned with your production security standards
  })
 
  try {
    await axios({
      method: 'DELETE',
      url: `${oscarConfig.MIDDLEWARE_API_URL}/metricstore/probes/${probeId}`,
      headers: {
        // Forward the Authorization header to the middleware API
        Authorization: apiToken,
        Accept: 'application/json'
      },
      httpsAgent
    })

    // Return 204 No Content if successful
    res.status(204).end()
  } catch (error) {
    console.error('Error forwarding DELETE probe request to middleware API', error)

    // Consider returning 204 if the error is because the resource doesn't exist
    if (error.response?.status === 404) {
      return res.status(204).end()
    }
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}
