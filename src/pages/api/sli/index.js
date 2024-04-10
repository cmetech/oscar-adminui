// pages/api/sli/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { q = '', column = '', sort = '', type } = query
    const queryLowered = q.toLowerCase()

    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/sli`, {
        headers: { 'X-API-Key': oscarConfig.API_KEY },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        // console.log('export targets', response?.data)
        const dataAsc = response.data.sort((a, b) => (a[column] < b[column] ? -1 : 1))
        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()

        const filteredData = dataToFilter.filter(
          item =>
            item?.id?.toString().toLowerCase().includes(queryLowered) ||
            item?.name?.toLowerCase().includes(queryLowered) ||
            item?.target?.calculation_method?.toLowerCase().includes(queryLowered)
        )

        res.status(response.status || 200).json({
          allData: response.data,
          total: filteredData.length,
          rows: filteredData
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error fetching slis:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'POST') {
    // Logic for handling POST request to add a new SLO
    try {
      let data = req.body

      // Explicit type conversion for target_value and period
      if (data.target) {
        data.target.target_value = parseFloat(data.target.target_value)
        data.target.period = parseInt(data.target.period)

        // Optionally, add validation to ensure the conversion was successful
        if (isNaN(data.target.target_value) || isNaN(data.target.period)) {
          throw new Error('Invalid target_value or period')
        }
      }

      // console.log('slo data', data)

      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/sli`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      // Respond with the data returned from the middleware backend
      res.status(response.status || 201).json(response.data)
    } catch (error) {
      console.error('Error adding SLO:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
