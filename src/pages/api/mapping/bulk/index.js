// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import FormData from 'form-data'
import oscarConfig from 'src/configs/oscarConfig'
import { IncomingForm } from 'formidable'
import fs from 'fs'

async function handler(req, res) {
  // console.log('Handler triggered for POST /api/mapping/bulk')

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Wrap the formidable parsing in a Promise to manage the asynchronous flow
  const form = new IncomingForm()

  try {
    const parseFormAsync = req =>
      new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          resolve({ fields, files })
        })
      })

    const { files } = await parseFormAsync(req)

    // console.log('Files:', files)

    const uploadedFile = files.file[0]

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const filePath = uploadedFile.filepath
    if (!filePath) {
      return res.status(500).json({ message: 'File path is undefined' })
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath), uploadedFile.originalFilename)

    // console.log('FormData Headers:', formData.getHeaders())

    const response = await axios.post(`${oscarConfig.MIDDLEWARE_MAPPING_API_URL}/mapping/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
    })

    if (response.status === 201 && response.data) {
      // Delete the uploaded file after successful upload
      fs.unlinkSync(filePath)

      console.log('Response Status:', response.status)
      console.log('Response Data:', response.data)
      res.status(response.status).json(response.data)
    }
  } catch (error) {
    console.error('Axios Error', error.toJSON())
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error('Status:', error.response.status)
      console.error('Headers:', error.response.headers)
      console.error('Data:', error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message)
    }

    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export default handler

// Disable Next.js default body parser for this API route
export const config = {
  api: {
    bodyParser: false
  }
}
