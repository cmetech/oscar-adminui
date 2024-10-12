// oscar-adminui/src/pages/api/rules/delete/[ruleName].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { ruleName } = req.query

  if (!ruleName) {
    return res.status(400).json({ message: "Invalid or missing 'ruleName'." })
  }

  const encodedRuleName = encodeURIComponent(ruleName)

  try {
    const response = await axios.delete(`${oscarConfig.MIDDLEWARE_API_URL}/rules/${encodedRuleName}`, {
      headers: {
        'X-API-Key': oscarConfig.API_KEY,
        Accept: 'application/json'
      },
      params: req.query, // Include any query parameters like 'namespace'
      httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
    })

    res.status(response.status || 204).end()
  } catch (error) {
    console.error('Error deleting rule:', error)
    if (error.response?.status === 404) {
      return res.status(204).end()
    }
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}
