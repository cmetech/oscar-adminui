// oscar-adminui/src/pages/api/rules/export/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { namespace } = req.query

    const params = {}
    if (namespace) {
      params.namespace = namespace
    }

    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/rules/export`, {
        params: params,
        responseType: 'arraybuffer', // Important for binary data
        headers: {
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      // Set appropriate headers for file download
      res.setHeader('Content-Type', response.headers['content-type'])
      res.setHeader('Content-Disposition', response.headers['content-disposition'])

      // Send the binary data as response
      res.status(response.status || 200).end(Buffer.from(response.data), 'binary')
    } catch (error) {
      console.error('Error exporting rules:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
