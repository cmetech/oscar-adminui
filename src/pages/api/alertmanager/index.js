// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import oscarConfig from '../../../configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { q = '', column = '', sort = '', type } = query
    const queryLowered = q.toLowerCase()

    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/alerts/`, {
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        // console.log('export targets', response?.data)
        const dataAsc = response.data.sort((a, b) => (a[column] < b[column] ? -1 : 1))
        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()

        const filteredData = dataToFilter.filter(
          item =>
            item?.id?.toString().toLowerCase().includes(queryLowered)
        )

        // Log the entire response data or any specific part of it
        console.log("Fetched data:", response.data);
        console.log("Filtered data:", filteredData);
        console.log("Length of filtered data:", filteredData.length);

        res.status(200).json({
          allData: response.data,
          total: filteredData.length,
          rows: filteredData
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error proxying export targets:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } 
  else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
