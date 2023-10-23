// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TableContainer from '@mui/material/TableContainer'
import CardActionArea from '@mui/material/CardActionArea'
import Link from 'next/link'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Component Imports
import { BarChart, Bar, ResponsiveContainer } from 'recharts'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'

const TabularSummaryStatisticsCard = props => {
  // ** Hook
  const theme = useTheme()

  const { title, data, chartData, total, caption, linkRoute } = props

  return (
    <Paper elevation={8}>
      <Card>
        <CardActionArea href={`${linkRoute}`} component={Link}>
          <CardHeader
            title={title}
            titleTypographyProps={{ sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' } }}
            action={
              <OptionsMenu
                iconProps={{ fontSize: '1.375rem' }}
                options={['Last 28 Days', 'Last Month', 'Last Year']}
                iconButtonProps={{ size: 'small', sx: { color: 'text.primary' } }}
              />
            }
          />
          <CardContent>
            <Box sx={{ mt: 2.75, mb: 4.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h3'>{total}</Typography>
                <Typography variant='caption'>{caption}</Typography>
              </Box>
              <Box sx={{ height: 75, width: '100%', maxWidth: '120px' }}>
                <ResponsiveContainer>
                  <BarChart height={100} data={chartData}>
                    <Bar dataKey='value' fill={theme.palette.primary.main} radius={4} barSize={5} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableBody>
                  {data.map(row => {
                    return (
                      <TableRow
                        key={row.title}
                        sx={{
                          '&:last-of-type td': { border: 0, pb: 0 },
                          '& .MuiTableCell-root': {
                            py: theme => `${theme.spacing(3.125)} !important`,
                            '&:last-of-type': { pr: 0 },
                            '&:first-of-type': { pl: 0 }
                          },
                          '&:first-of-type td': { borderTop: theme => `1px solid ${theme.palette.divider}` }
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              '& svg': { mr: 1.8, color: `${row.color}` }
                            }}
                          >
                            <Icon icon='mdi:circle' fontSize='1.05rem' />
                            <Typography sx={{ fontSize: '0.875rem' }}>{row.title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.sales}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              '& svg': { color: row.trendDir === 'down' ? 'error.main' : 'success.main' }
                            }}
                          >
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.trendNumber}</Typography>
                            <Icon icon={row.trendDir === 'down' ? 'mdi:chevron-down' : 'mdi:chevron-up'} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </CardActionArea>
      </Card>
    </Paper>
  )
}

export default TabularSummaryStatisticsCard
