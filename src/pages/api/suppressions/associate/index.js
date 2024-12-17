// Next.js API route for associating a suppression window with a rule
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { rule_id, suppression_id } = req.query

  // Validate required query parameters
  if (!rule_id || !suppression_id) {
    return res.status(400).json({
      message: 'Both rule_id and suppression_id are required query parameters'
    })
  }

  try {
    const response = await axios.post(
      `${oscarConfig.MIDDLEWARE_API_URL}/suppressions/${suppression_id}/associate/${rule_id}`,
      {},
      {
        headers: {
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      }
    )

    return res.status(204).end()
  } catch (error) {
    console.error('Error associating suppression window with rule:', error)

    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.detail || 'Error associating suppression window with rule'
    })
  }
}

export default handler
