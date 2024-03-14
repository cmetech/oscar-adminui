// pages/api/tasks/history/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { q = '', column = '', sort = '', type } = query
    const queryLowered = q.toLowerCase()

    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/history`, {
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
            item?.state?.toLowerCase().includes(queryLowered) ||
            item?.alias?.toLowerCase().includes(queryLowered) ||
            item?.worker?.toLowerCase().includes(queryLowered)
        )

        res.status(200).json({
          allData: response.data,
          total: filteredData.length,
          rows: filteredData
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
