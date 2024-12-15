// Next.js API route for a specific suppression
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { name } = req.query

  if (req.method === 'GET') {
    // Handle fetching a specific suppression
    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions/${name}`, {
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(response.status || 200).json(response.data)
      } else {
        res.status(404).json({ message: 'Suppression not found' })
      }
    } catch (error) {
      console.error(`Error fetching suppression ${name}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'PUT') {
    // Handle updating a suppression
    try {
      const data = req.body

      const response = await axios.put(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions/${name}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      res.status(response.status || 200).json(response.data)
    } catch (error) {
      console.error(`Error updating suppression ${name}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message, details: error.response?.data })
    }
  } else if (req.method === 'DELETE') {
    // Handle deleting a suppression
    try {
      const response = await axios.delete(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions/${name}`, {
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      res.status(response.status || 204).end()
    } catch (error) {
      console.error(`Error deleting suppression ${name}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
