// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      // Extract the list of server IDs from the request body
      const { ids } = req.body

      // console.log('Received IDs:', ids)

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid input: 'ids' must be a non-empty array." })
      }

      // Call the underlying middleware API
      const response = await axios.put(
        `${oscarConfig.MIDDLEWARE_INVENTORY_API_URL}/servers/bulk`,
        ids, // Send the list of IDs in the request body
        {
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json'
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        }
      )

      // Since there's no content to return, send a 204 status code and a message acknowledging the deletion
      res.status(204).end()
    } catch (error) {
      console.error('Error calling middleware API:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
