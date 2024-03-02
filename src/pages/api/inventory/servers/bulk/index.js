// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { IncomingForm } from 'formidable'
import fs from 'fs'

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
  } else if (req.method === 'POST') {
    // Parse the form data
    const form = new IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err)

        return res.status(500).json({ message: 'Form data parsing error' })
      }

      // Check if the file is provided
      const uploadedFile = files.file
      if (!uploadedFile) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      // Here, ensure you're accessing the correct property for the file path
      const filePath = uploadedFile.filepath // Adjust this line if the property name is different

      // Verify filePath is not undefined
      if (!filePath) {
        return res.status(500).json({ message: 'File path is undefined' })
      }

      // Now use filePath with fs.createReadStream
      const formData = new FormData()
      formData.append('file', fs.createReadStream(filePath), uploadedFile.originalFilename)

      try {
        // Forward the file to the middleware API
        const response = await axios.post(`${oscarConfig.MIDDLEWARE_INVENTORY_API_URL}/servers/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        })

        // Forward the response from the middleware API back to the client
        return res.status(response.status).json(response.data)
      } catch (error) {
        console.error('Error uploading file to middleware API:', error)

        return res.status(error.response?.status || 500).json({ message: 'Error uploading file' })
      }
    })
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler

// Disable Next.js default body parser for this API route
export const config = {
  api: {
    bodyParser: false
  }
}
