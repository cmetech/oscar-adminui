import React from 'react'
import { DataGrid, DataGridPro } from '@mui/x-data-grid-pro'
import { Box, Typography } from '@mui/material'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'

const columns = [
  { field: 'sliName', headerName: 'Service Level Indicator', width: 200 },
  {
    field: 'sloPercentage',
    headerName: 'SLO %',
    width: 130,
    renderCell: params => `${params.value}%`
  },
  {
    field: 'sparkline',
    headerName: 'Trend',
    width: 200,
    renderCell: params => {
      const data = params.row.sparklineData.map((value, index) => ({ id: index, value }))

      return (
        <SparkLineChart
          data={[
            81.82, 83.33, 100, 91.67, 84.62, 90.91, 83.33, 75, 75, 83.33, 91.67, 83.33, 91.67, 91.67, 83.33, 100, 91.67,
            100, 90.91, 100, 83.33, 75, 100, 91.67
          ]}
        />
      )
    }
  },
  {
    field: 'budgetRemaining',
    headerName: 'Budget Remaining',
    width: 200,
    renderCell: params => `${params.value}%`
  }

  // Add more columns as needed
]

const rows = [
  // Populate this with data from your API
  {
    id: 1,
    sliName: 'banking-service latency',
    sloPercentage: 100,
    sparklineData: [85, 90, 95, 100, 90, 80, 70],
    budgetRemaining: '100%'

    // Add more fields as needed
  }

  // Add more rows as needed
]

const SLOTable = () => {
  return (
    <Box style={{ height: 400, width: '100%' }}>
      <DataGridPro rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
    </Box>
  )
}

export default SLOTable
