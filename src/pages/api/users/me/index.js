import axios from 'axios'
import { fi } from 'date-fns/locale'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const apiToken = req.headers.authorization

  // Create an instance of https.Agent for the request to bypass SSL certificate errors
  const httpsAgent = new https.Agent({
    rejectUnauthorized: oscarConfig.SSL_VERIFY // Remember, this is for development only!
  })

  try {
    const response = await axios({
      method: req.method,
      url: process.env.NEXT_PUBLIC_API_URL + '/users/me',
      headers: {
        Authorization: apiToken,
        Accept: 'application/json'
      },
      data: req.method === 'PATCH' ? req.body : undefined, // Forward the request body for PATCH requests
      httpsAgent
    })

    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}

export default handler
