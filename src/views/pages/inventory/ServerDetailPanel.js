import React, { useState } from 'react'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { CustomDataGrid, TabList } from 'src/lib/styled-components'

const ServerDetailPanel = props => {
  const [value, setValue] = useState('1')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <TabList onChange={handleChange} aria-label='Network and Metadata tabs'>
          <Tab label='Network Interfaces' value='1' />
          <Tab label='Metadata' value='2' />
        </TabList>
        <TabPanel value='1'>
          <Box sx={{ height: 300, width: '100%' }}>
            <Typography>Network Interfaces content goes here.</Typography>
          </Box>
        </TabPanel>
        <TabPanel value='2'>
          <Box sx={{ height: 300, width: '100%' }}>
            <Typography>Metadata content goes here.</Typography>
          </Box>
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default ServerDetailPanel
