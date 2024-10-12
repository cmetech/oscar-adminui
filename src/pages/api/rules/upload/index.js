// oscar-adminui/src/pages/api/rules/upload/index.js
import axios from 'axios'
import https from 'https'
import FormData from 'form-data'
import oscarConfig from 'src/configs/oscarConfig'
import formidable from 'formidable'
import fs from 'fs'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Disable Next.js default body parser
  const form = new formidable.IncomingForm()

  try {
    const parseFormAsync = () =>
      new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          resolve({ fields, files })
        })
      })

    const { files } = await parseFormAsync()

    const uploadedFile = files.file

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const filePath = uploadedFile.filepath || uploadedFile.path
    if (!filePath) {
      return res.status(500).json({ message: 'File path is undefined' })
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath), uploadedFile.originalFilename || uploadedFile.name)

    const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/rules/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-API-Key': oscarConfig.API_KEY
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
    })

    if (response.status === 201 && response.data) {
      // Optionally delete the uploaded file after successful upload
      fs.unlinkSync(filePath)
      res.status(response.status).json(response.data)
    } else {
      res.status(500).json({ message: 'An error occurred in the middleware API' })
    }
  } catch (error) {
    console.error('Error uploading rules:', error)
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}

export default handler

// Disable Next.js default body parser for this API route
export const config = {
  api: {
    bodyParser: false
  }
}
