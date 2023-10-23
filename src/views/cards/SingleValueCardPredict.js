// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import CustomChip from 'src/@core/components/mui/chip'
import CardActionArea from '@mui/material/CardActionArea'
import Paper from '@mui/material/Paper'
import Link from 'next/link'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines'

const SingleValueCardPredict = props => {
  const { bgcolor, title, value, valueTo, probability, trendDir, showSparkline, linkRoute, sparklineData } = props

  return (
    <Paper elevation={12}>
      {linkRoute ? (
        <Card sx={{ border: 0, boxShadow: 0, color: 'common.white', backgroundColor: bgcolor }}>
          <CardActionArea href={linkRoute} component={Link}>
            {value === 0 ? (
              <Typography sx={{ display: 'flex', fontWeight: 500, alignItems: 'right', justifyContent: 'right', m: 1 }}>
                <CustomChip
                  rounded
                  size='small'
                  label='Alerts'
                  color='info'
                  avatar={
                    <Avatar>
                      <Icon icon='mdi:bell-ring' fontSize={20} />
                    </Avatar>
                  }
                />
              </Typography>
            ) : null}
            <CardContent sx={{ p: theme => `${theme.spacing(2, 12, 1)} !important` }}>
              <Box minHeight='11vh'>
                <Box display='flex' justifyContent='center' alignItems='center'>
                  <Typography variant='h4' sx={{ mb: 0, fontWeight: 900, color: 'common.white' }}>
                    {value}
                  </Typography>
                  <Stack spacing={0}>
                    <Icon
                      icon={trendDir === 'down' ? 'mdi:arrow-bottom-right-thick' : 'mdi:arrow-top-right-thick'}
                      sx={{ fontSize: '1.5em' }}
                    />
                  </Stack>
                </Box>
                <Box display='flex' justifyContent='center' alignItems='center' sx={{ mb: 2 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'common.white' }}>
                    Confidence : {probability}%
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='center' alignItems='center' sx={{ mb: 2 }}>
                  <Typography variant='h6' sx={{ fontWeight: 600, color: 'common.white' }}>
                    {title}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='center' alignItems='center' sx={{ mb: 1, pb: 1 }}>
                  {showSparkline ? (
                    <Sparklines data={sparklineData} height={15}>
                      <SparklinesLine color='white' style={{ fill: 'none', strokeWidth: 2 }} />
                    </Sparklines>
                  ) : null}
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ) : (
        <Card sx={{ border: 0, boxShadow: 0, color: 'common.white', backgroundColor: bgcolor }}>
          {value === 0 ? (
            <Typography sx={{ display: 'flex', fontWeight: 500, alignItems: 'right', justifyContent: 'right', m: 1 }}>
              <CustomChip
                rounded
                size='small'
                label='Alerts'
                color='info'
                avatar={
                  <Avatar>
                    <Icon icon='mdi:bell-ring' fontSize={20} />
                  </Avatar>
                }
              />
            </Typography>
          ) : null}
          <CardContent sx={{ p: theme => `${theme.spacing(2, 12, 1)} !important` }}>
            <Box minHeight='11vh'>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <Typography variant='h2' sx={{ mb: 0, fontWeight: 900, color: 'common.white' }}>
                  {value}
                </Typography>
                <Stack spacing={0} sx={{ ml: 2 }}>
                  <Icon
                    icon={trendDir === 'down' ? 'mdi:arrow-bottom-right-thick' : 'mdi:arrow-top-right-thick'}
                    sx={{ fontSize: '1.5em' }}
                  />
                  <Typography variant='body2' sx={{ mb: 0, fontWeight: 600, color: 'common.white' }}>
                    0.{trendValue}%
                  </Typography>
                </Stack>
              </Box>
              <Box display='flex' justifyContent='center' alignItems='center' sx={{ mb: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 600, color: 'common.white' }}>
                  {title}
                </Typography>
              </Box>
              <Box display='flex' justifyContent='center' alignItems='center' sx={{ mb: 1, pb: 1 }}>
                {showSparkline ? (
                  <Sparklines data={sparklineData} height={15}>
                    <SparklinesLine color='white' style={{ fill: 'none', strokeWidth: 2 }} />
                  </Sparklines>
                ) : null}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Paper>
  )
}

export default SingleValueCardPredict
