// pages/api/chat.js

import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig' // Adjust the import path accordingly

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message, user_details } = req.body
    const { first_name, last_name, email, timezone, username } = user_details || {}

    // Console log the destructured req.body
    console.log('message:', message)
    console.log('first_name:', first_name)
    console.log('last_name:', last_name)
    console.log('email:', email)
    console.log('timezone:', timezone)
    console.log('username:', username)

    try {
      // Create an HTTPS agent that disables SSL verification (for self-signed certs)
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false
      })

      // Prepare the API request to the middleware
      const middlewareUrl = `${oscarConfig.MIDDLEWARE_API_URL}/chat`

      const response = await axios.post(
        middlewareUrl,
        {
          message,
          user_details: {
            first_name,
            last_name,
            email,
            timezone,
            username
          }
        },
        {
          httpsAgent, // Use the custom HTTPS agent
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Response from middleware:', response.data)

      // Get the reply from the middleware response
      const reply = response.data.message

      // Send the reply back to the frontend
      res.status(200).json({ message: reply })
    } catch (error) {
      console.error('Error communicating with middleware:', error)

      // Handle specific error cases if necessary
      if (error.response) {
        // The request was made, and the server responded with a status code outside of the 2xx range
        res.status(error.response.status).json({
          error: 'Failed to get response from middleware',
          details: error.response.data
        })
      } else if (error.request) {
        // The request was made, but no response was received
        res.status(502).json({
          error: 'No response from middleware'
        })
      } else {
        // Something happened in setting up the request
        res.status(500).json({
          error: 'Internal server error'
        })
      }
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
