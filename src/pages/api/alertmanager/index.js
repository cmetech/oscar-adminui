// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import oscarConfig from '../../../configs/oscarConfig'

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
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/alerts/`)
      
      if (start_time) url.searchParams.append('start_time', start_time)
      if (end_time) url.searchParams.append('end_time', end_time)
      url.searchParams.append('page', skip)
      url.searchParams.append('perPage', limit)
      url.searchParams.append('column', column)
      url.searchParams.append('order', sort)

      const response = await axios.get(url.toString(), {
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {

        // console.log('export targets', response?.data)
        //const dataAsc = response.data.sort((a, b) => (a[column] < b[column] ? -1 : 1))
        //const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()

        if (response?.data?.records?.length > 0) {
          const filteredData = response?.data?.records?.filter(
            item =>
            item?.alert_id?.toString().toLowerCase().includes(queryLowered) ||
            item?.alertname?.toLowerCase().includes(queryLowered) ||
            item?.alert_status?.toLowerCase().includes(queryLowered) ||
            item?.severity?.toLowerCase().includes(queryLowered) ||
            item?.instance?.toLowerCase().includes(queryLowered)
          )

          // Log the entire response data or any specific part of it
          //console.log("Fetched data:", response.data);
          //console.log("Filtered data:", filteredData);
          //console.log("Length of filtered data:", filteredData.length);

          res.status(200).json({
            records: response.data.records,
            total_filtered_records: filteredData.length,
            total_pages: response.data.total_pages,
            total_records: response.data.total_records,
            rows: filteredData || []
          })
        } else {
          res.status(200).json({ 
            records: [],
            total_filtered_records: 0,
            total_pages: 0,
            total_records: 0,
            rows: []
          })
        }
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
