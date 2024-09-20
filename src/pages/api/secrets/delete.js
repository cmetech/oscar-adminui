import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const httpsAgent = new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
  const { path, key, delete_empty_paths } = req.query

  if (!path || !key) {
    return res.status(400).json({ message: 'Path and key are required' })
  }

  try {
    const url = `${oscarConfig.MIDDLEWARE_API_URL}/vault/secrets`

    const response = await axios.delete(url, {
      data: {
        paths: {
          [path]: [key]
        },
        delete_empty_paths: delete_empty_paths === 'true'
      },
      timeout: 30000,
      httpsAgent,
      headers: { 'Content-Type': 'application/json' }
    })

    res.status(response.status || 200).json(response.data)
  } catch (error) {
    console.error('Error deleting secret:', error)
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}
