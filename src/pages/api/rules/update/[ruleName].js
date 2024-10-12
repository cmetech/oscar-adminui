// oscar-adminui/src/pages/api/rules/update/[ruleName].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { ruleName } = req.query

  if (req.method === 'PUT') {
    const payload = req.body

    // URI-encode ruleName to handle special characters
    const encodedRuleName = encodeURIComponent(ruleName)

    try {
      const response = await axios.put(`${oscarConfig.MIDDLEWARE_API_URL}/rules/${encodedRuleName}`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY,
          'Content-Type': 'application/json'
        },
        params: req.query, // Forward any additional query parameters like 'namespace'
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(response.status || 200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error updating rule ${ruleName}:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
