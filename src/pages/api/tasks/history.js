// pages/api/tasks/history/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { q = '', column = '', sort = '', type, start_time, end_time, skip = '1', limit = '100' } = query
    const queryLowered = q.toLowerCase()

    console.log('start_time', start_time)
    console.log('end_time', end_time)
    console.log('skip', skip)
    console.log('limit', limit)
    console.log('column', column)
    console.log('sort', sort)
    console.log('type', type)
    console.log('query', q)

    try {
      // Construct the request URL with query parameters
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/history`)
      if (start_time) url.searchParams.append('start_time', start_time)
      if (end_time) url.searchParams.append('end_time', end_time)
      url.searchParams.append('page', skip)
      url.searchParams.append('perPage', limit)
      url.searchParams.append('column', column)
      url.searchParams.append('order', sort)

      // console.log('url', url.toString())

      const response = await axios.get(url.toString(), {
        headers: { 'X-API-Key': oscarConfig.API_KEY },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        // console.log('response', response?.data)

        console.log('total_pages', response.data.total_pages)
        console.log('total_records', response.data.total_records)

        // const dataAsc = response.data.records.sort((a, b) => (a[column] < b[column] ? -1 : 1))
        // const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()

        if (response?.data?.records?.length > 0) {
          const filteredData = response?.data?.records?.filter(
            item =>
              item?.id?.toString().toLowerCase().includes(queryLowered) ||
              item?.name?.toLowerCase().includes(queryLowered) ||
              item?.state?.toLowerCase().includes(queryLowered) ||
              item?.alias?.toLowerCase().includes(queryLowered) ||
              item?.worker?.toLowerCase().includes(queryLowered)
          )

          res.status(200).json({
            total_filtered_records: filteredData.length,
            total_pages: response.data.total_pages,
            total_records: response.data.total_records,
            records: response.data.records,
            rows: filteredData || []
          })
        } else {
          res.status(200).json({
            allData: [],
            total: 0,
            rows: []
          })
        }
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
