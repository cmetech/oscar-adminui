// pages/api/users/[id].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { validateUUID } from 'src/lib/utils'

export default async function handler(req, res) {
  const { id } = req.query // Extract the user ID from the request URL
  const apiToken = req.headers.authorization // Assume the apiToken is passed in the request headers

  // Create an instance of https.Agent for the request to bypass SSL certificate errors
  const httpsAgent = new https.Agent({
    rejectUnauthorized: oscarConfig.SSL_VERIFY // Remember, this is for development only!
  })

  // Check if taskId is undefined or not a valid UUID
  if (!id || !validateUUID(id)) {
    return res.status(400).json({ message: "Invalid or missing 'SLO identifier'. A valid UUID is required." })
  }

  // console.log(`Request body for ${req.method} request to /datacenters/${id}:`, req.body)
  try {
    const middlewareResponse = await axios({
      method: req.method,
      url: `${oscarConfig.MIDDLEWARE_API_URL}/sli/${id}`,
      headers: {
        Accept: 'application/json'
      },
      data: req.method === 'PUT' ? req.body : undefined, // Forward the request body for PUT requests
      httpsAgent
    })

    // Special handling for DELETE requests
    if (req.method === 'DELETE') {
      // For DELETE, return 204 No Content if successful
      return res.status(204).end()
    }

    // Forward the middleware API's response back to the client for other methods
    res.status(middlewareResponse.status).json(middlewareResponse.data)
  } catch (error) {
    console.error('Error forwarding request to middleware API', error)

    // For DELETE, also consider returning 204 if the error is because the resource doesn't exist
    if (req.method === 'DELETE' && error.response?.status === 404) {
      return res.status(204).end()
    }
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}
