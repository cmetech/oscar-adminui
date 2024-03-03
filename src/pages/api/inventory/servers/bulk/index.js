// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { IncomingForm } from 'formidable'
import fs from 'fs'

async function handler(req, res) {
  if (req.method === 'POST') {
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
