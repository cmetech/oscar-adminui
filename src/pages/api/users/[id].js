// pages/api/users/[id].js
import axios from 'axios'
import https from 'https'

export default async function handler(req, res) {
  const { id } = req.query // Extract the user ID from the request URL
  const apiToken = req.headers.authorization // Assume the apiToken is passed in the request headers

  // Create an instance of https.Agent for the request to bypass SSL certificate errors
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false // Remember, this is for development only!
  })

  try {
    const middlewareResponse = await axios({
      method: req.method,
      url: `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
      headers: {
        // Forward the Authorization header to the middleware API
        Authorization: apiToken,
        Accept: 'application/json'
      },
      data: req.method === 'PATCH' ? req.body : undefined, // Forward the request body for PATCH requests
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
