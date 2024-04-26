// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import MuiTabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CardStatisticsVerticalComponent from 'src/@core/components/card-statistics/card-stats-vertical'

import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import TabularSummaryStatisticsCard from 'src/views/cards/TabularSummaryStatisticsCard'
import SingleValueCard from 'src/views/cards/SingleValueCard'
import SingleValueCardPredict from 'src/views/cards/SingleValueCardPredict'

// ** Fake Data
import { alarmData } from 'src/@fake/data/system_incidents'
import { orderData } from 'src/@fake/data/tps_statistics'
import { securityData } from 'src/@fake/data/security_incidents'

import { useSettings } from 'src/@core/hooks/useSettings'

const chartOrderData = [
  { value: 50 },
  { value: 30 },
  { value: 500 },
  { value: 75 },
  { value: 40 },
  { value: 75 },
  { value: 20 }
]

const transData = [
  {
    sales: '86,471',
    title: 'WSIL',
    trendDir: 'down',
    color: 'customColors.brandGreen1',
    trendNumber: '15%'
  },
  {
    trendDir: 'up',
    sales: '57,484',
    title: 'BSCS',
    color: 'customColors.brandBlack',
    trendNumber: '85%'
  },
  {
    sales: '2,534',
    trendDir: 'up',
    color: 'ericsson.brandYellow1',
    title: 'EPCOMON',
    trendNumber: '48%'
  },
  {
    sales: '977',
    title: 'SPECTRUM',
    color: 'ericsson.brandRed1',
    trendDir: 'down',
    trendNumber: '36%'
  },
  {
    sales: '977',
    title: 'VERTEX',
    color: 'customColors.brandOrange1',
    trendDir: 'down',
    trendNumber: '36%'
  }
]

const Home = () => {
  // ** State
  const [value, setValue] = useState('1')

  const { settings } = useSettings()
  const { mode } = settings

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  // Styled TabList
  const TabList = styled(MuiTabList)(({ theme }) => ({
    '& .MuiTab-root': {
      minHeight: 38,
      minWidth: 130,
      borderRadius: 6,
      color:
        theme.palette.mode === 'light' ? theme.palette.customColors.brandBlack : theme.palette.customColors.brandWhite,
      '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'light' ? '#E5E5E5' : theme.palette.primary.main,
        color:
          theme.palette.mode === 'light' ? theme.palette.customColors.brandBlue : theme.palette.customColors.brandBlue
      }
    },
    '& .MuiTab-root:hover': {
      color:
        theme.palette.mode === 'light' ? theme.palette.customColors.brandBlue : theme.palette.customColors.brandBlue
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    }
  }))

  return (
    <ApexChartWrapper>
      <Stack direction='column' spacing={4}>
        <Box>
          <TabContext value={value}>
            <TabList onChange={handleChange} aria-label='simple tabs example'>
              <Tab value='1' label='Last Hour' />
            </TabList>
            <TabPanel value='1'>
              <Stack spacing={10}>
                <Box>
                  <Grid container spacing={6}>
                    <Grid item xs={12} sm={6} md={3}>
                      <SingleValueCard
                        bgcolor='customColors.brandGreen4'
                        title='Critical API Performance'
                        value='88.5'
                        trendDir='up'
                        trendValue='0.86'
                        showSparkline={true}
                        sparklineData={[
                          81.82, 83.33, 100, 91.67, 84.62, 90.91, 83.33, 75, 75, 83.33, 91.67, 83.33, 91.67, 91.67,
                          83.33, 100, 91.67, 100, 90.91, 100, 83.33, 75, 100, 91.67
                        ]}
                        linkRoute='/taskrequest'
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <SingleValueCard
                        bgcolor='customColors.brandGreen4'
                        title='Service Level Agreement'
                        value='99.8'
                        trendDir='down'
                        trendValue='67'
                        showSparkline={false}
                        sparklineData={chartOrderData}
                        linkRoute='/sla'
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <SingleValueCard
                        bgcolor='customColors.brandGreen4'
                        title='Health Score'
                        value='98.7'
                        trendDir='up'
                        trendValue='37'
                        showSparkline={false}
                        linkRoute='/health/eda'
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <SingleValueCard
                        bgcolor='customColors.brandGreen'
                        title='Notable Events'
                        value='0'
                        trendDir='up'
                        trendValue='0'
                        showSparkline={false}
                        linkRoute='/events'
                      />
                    </Grid>
                  </Grid>
                </Box>
                <Box>
                  <Grid container spacing={6}>
                    <Grid item xs={12} md={6} lg={4} sx={{ order: 0 }}>
                      <TabularSummaryStatisticsCard
                        title='TPS Statistics'
                        data={orderData.lastHour}
                        chartData={chartOrderData}
                        total={orderData.lastHour.reduce((acc, cur) => {
                          return acc + parseInt(cur.sales, 10)
                        }, 0)}
                        caption='Total Transactions'
                      />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} sx={{ order: 0 }}>
                      <TabularSummaryStatisticsCard
                        title='System Incidents'
                        data={alarmData.lastHour}
                        chartData={chartOrderData}
                        total={alarmData.lastHour.reduce((acc, cur) => {
                          return acc + parseInt(cur.sales, 10)
                        }, 0)}
                        caption='Total System Incidents'
                        linkRoute='/events'
                      />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} sx={{ order: 0 }}>
                      <TabularSummaryStatisticsCard
                        title='Security Incidents'
                        data={securityData.lastHour}
                        chartData={chartOrderData}
                        total={securityData.lastHour.reduce((acc, cur) => {
                          return acc + parseInt(cur.sales, 10)
                        }, 0)}
                        caption='Total Security Incidents'
                        linkRoute='/security'
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </TabPanel>
          </TabContext>
        </Box>
      </Stack>
    </ApexChartWrapper>
  )
}

Home.acl = {
  action: 'read',
  subject: 'overview-page'
}

export default Home
