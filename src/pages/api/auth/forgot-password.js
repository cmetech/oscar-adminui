// pages/api/auth/forgot-password.js
import axios from 'axios'
import https from 'https'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Create an instance of https.Agent for the request to bypass SSL certificate errors
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false // Remember, this is for development only!
    })

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/forgot-password', req.body, {
        httpsAgent
      })
      if (response) {
        const status = response.status
        res.status(status).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    // Handle any other HTTP methods as needed, or send a 405 Method Not Allowed response
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
