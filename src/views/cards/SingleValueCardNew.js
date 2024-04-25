import React from 'react'
import { Box, Card, Typography, useTheme } from '@mui/material'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'

const SingleValueCardNew = ({ title, apiName, value, trend, target, timeRange, sparklineData }) => {
  const theme = useTheme()

  const cardStyle = {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    color: theme.palette.secondary.contrastText
  }

  const titleStyle = {
    fontSize: '1rem',
    fontWeight: theme.typography.fontWeightMedium,
    marginBottom: theme.spacing(1)
  }

  const valueStyle = {
    fontSize: '2.125rem',
    fontWeight: theme.typography.fontWeightBold
  }

  const targetStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }

  const trendStyle = {
    display: 'flex',
    alignItems: 'center',
    '& .trend-icon': {
      fontSize: '1.5rem',
      marginRight: theme.spacing(0.5)
    },
    '& .trend-value': {
      fontSize: '0.875rem',
      fontWeight: theme.typography.fontWeightMedium
    }
  }

  const chartBoxStyle = {
    height: '50px' // Adjust this value as needed
  }

  return (
    <Card sx={cardStyle}>
      <Typography variant='h6' sx={titleStyle}>
        API Response Time
      </Typography>
      <Box>
        <Typography sx={titleStyle}>apiName: {apiName}</Typography>
        <Box sx={targetStyle}>
          <Box sx={trendStyle}>
            {/* Replace "trend-icon" with actual icon and its conditional rendering based on trend */}
            <span className='trend-icon'>⬆️</span>
            <span className='trend-value'>{trend}%</span>
          </Box>
          <Typography variant='caption' component='div'>
            Target {target}%
          </Typography>
        </Box>
        <Typography sx={valueStyle}>{value}%</Typography>
      </Box>
      {/* Sparkline chart */}
      {sparklineData && sparklineData.length > 0 && (
        <Box sx={chartBoxStyle}>
          <SparkLineChart
            data={sparklineData}
            area={true}
            height={50}
            curve='natural'
            colors={['#fff']}
            showHighlight={true}
            showTooltip={true}
            plotType='line'
          />
        </Box>
      )}
      {/* Time range chip */}
      <Typography variant='caption' component='div' sx={{ marginTop: theme.spacing(1) }}>
        {timeRange}
      </Typography>
    </Card>
  )
}

export default SingleValueCardNew
