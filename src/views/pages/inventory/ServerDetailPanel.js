import React, { useState } from 'react'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { CustomDataGrid, TabList } from 'src/lib/styled-components'
import { useTranslation } from 'react-i18next'
import { parseISO, format } from 'date-fns'
import formatDistance from 'date-fns/formatDistance'

const ServerDetailPanel = props => {
  const [value, setValue] = useState('1')
  const { row } = props
  const { t } = useTranslation()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  // Define columns for network interfaces DataGrid
  const networkColumns = [
    {
      field: 'id',
      headerName: t('Identifier'),
      flex: 0.035,
      minWidth: 150,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.id.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'name',
      headerName: t('Name'),
      flex: 0.025,
      minWidth: 150,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.name.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'ip_address',
      headerName: t('IP Address'),
      flex: 0.025,
      minWidth: 150,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.ip_address}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'label',
      headerName: t('Label'),
      flex: 0.025,
      minWidth: 150,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.label.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'created_at',
      headerName: t('Created At'),
      flex: 0.025,
      minWidth: 150,
      renderCell: params => {
        const { row } = params

        const createdAtDate = parseISO(row.created_at.substring(0, 19))
        const humanReadableDate = format(createdAtDate, 'PPpp')

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {humanReadableDate}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'modified_at',
      headerName: t('Updated At'),
      flex: 0.025,
      minWidth: 150,
      renderCell: params => {
        const { row } = params

        const createdAtDate = parseISO(row.modified_at.substring(0, 19))
        const humanReadableDate = format(createdAtDate, 'PPpp')

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {humanReadableDate}
              </Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  // Define columns for metadata DataGrid
  const metadataColumns = [
    {
      field: 'key',
      headerName: t('Key'),
      flex: 0.015,
      width: 100,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.key.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'value',
      headerName: t('Value'),
      flex: 0.025,
      minWidth: 150,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.value.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <TabList onChange={handleChange} aria-label='Network and Metadata tabs'>
          <Tab label={t('Network Interfaces')} value='1' />
          <Tab label={t('Metadata')} value='2' />
        </TabList>
        <TabPanel value='1'>
          <CustomDataGrid
            rows={row.network_interfaces.map((ni, index) => ({
              id: index,
              ...ni
            }))}
            columns={networkColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
          />
        </TabPanel>
        <TabPanel value='2'>
          <CustomDataGrid
            rows={row.metadata.map((md, index) => ({
              id: index,
              ...md
            }))}
            columns={metadataColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
          />
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default ServerDetailPanel
