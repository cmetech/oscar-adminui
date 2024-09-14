import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  console.log('API route hit. Method:', req.method)
  const httpsAgent = new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })

  if (req.method === 'GET') {
    const { path = '', limit = 1000 } = req.query

    try {
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/vault/secrets`)
      url.searchParams.append('path', path)
      url.searchParams.append('format', 'flat')

      const response = await axios.get(url.toString(), {
        timeout: 30000,
        httpsAgent
      })

      res.status(response.status || 200).json(response.data)
    } catch (error) {
      console.error('Error fetching secrets:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { path, secret } = req.body

      const url = `${oscarConfig.MIDDLEWARE_API_URL}/vault/secrets`

      const response = await axios.post(
        url,
        { path, secret },
        {
          timeout: 30000,
          httpsAgent,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      res.status(response.status || 201).json(response.data)
    } catch (error) {
      console.error('Error creating/updating secret:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'DELETE') {
    console.log('DELETE method detected')
    try {
      console.log('Raw request body:', req.body)
      const { paths, delete_empty_paths } = req.body
      console.log('Parsed paths:', paths)
      console.log('Parsed delete_empty_paths:', delete_empty_paths)

      const url = `${oscarConfig.MIDDLEWARE_API_URL}/vault/secrets`
      console.log('Constructed URL:', url)

      const response = await axios.delete(url, {
        data: { paths, delete_empty_paths },
        timeout: 30000,
        httpsAgent,
        headers: { 'Content-Type': 'application/json' }
      })

      console.log('Downstream API response:', response.status, response.data)

      res.status(response.status || 200).json(response.data)
    } catch (error) {
      console.error('Error in DELETE handler:', error)
      res.status(400).json({ message: 'Invalid request body', error: error.message })

      return
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
