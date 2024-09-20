// pages/api/tasks/run/[taskId].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { taskId } = req.query

  if (req.method === 'POST') {
    let { prompts, user_data } = req.body

    // Ensure prompts defaults to an empty list if not provided or null
    prompts = prompts || []

    // Log the payload before sending it to the middleware
    const payload = { prompts, user_data }
    console.log('Payload sent to middleware:', JSON.stringify(payload, null, 2))

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/run/${taskId}`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY, // Ensure you have this in your oscarConfig or fetch it from a secure place
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(200).json({
          data: response.data
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      // Log the error response
      if (error.response) {
        console.error(`Error response data: ${JSON.stringify(error.response.data, null, 2)}`)
        console.error(`Error response status: ${error.response.status}`)
        console.error(`Error response headers: ${JSON.stringify(error.response.headers, null, 2)}`)
      } else {
        console.error('Error without response:', error.message)
      }
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler