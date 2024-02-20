import * as React from 'react'
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { useQuery } from '@tanstack/react-query'
import { fetchServices } from '../../api-helpers/fetchServices'
import { styled, useTheme } from '@mui/material/styles'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'

// ** Custom Components
//import CustomChip from 'src/@core/components/mui/chip'
import ServiceCustomChip from 'src/views/pages/misc/ServiceCustomChip'

function customCheckbox(theme) {
  return {
    '& .MuiCheckbox-root svg': {
      width: 16,
      height: 16,
      backgroundColor: 'transparent',
      border: `1px solid ${
        theme.palette.mode === 'light' ? theme.palette.customColors.brandGray2 : theme.palette.customColors.brandWhite
      }`,
      borderRadius: 2
    },
    '& .MuiCheckbox-root svg path': {
      display: 'none'
    },
    '& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg': {
      backgroundColor: '#1890ff',
      borderColor: '#1890ff'
    },
    '& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after': {
      position: 'absolute',
      display: 'table',
      border: '2px solid #fff',
      borderTop: 0,
      borderLeft: 0,
      transform: 'rotate(45deg) translate(-50%,-50%)',
      opacity: 1,
      transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
      content: '""',
      top: '50%',
      left: '39%',
      width: 5.71428571,
      height: 9.14285714
    },
    '& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after': {
      width: 8,
      height: 8,
      backgroundColor: '#1890ff',
      transform: 'none',
      top: '39%',
      border: 0
    }
  }
}

function customDataGridPanel(theme) {
  return {
    '& .MuiDataGrid-panelHeader .MuiInput-root .MuiInput-input:after': {
      color: theme.palette.mode === 'light' ? '#000' : '#fff'
    }
  }
}

const EricssonDataGrid = styled(DataGridPro)(({ theme }) => ({
  border: 0,
  color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"'
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d'
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none'
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor:
      theme.palette.mode === 'light' ? theme.palette.customColors.brandGray3 : theme.palette.customColors.brandGray3
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
  },
  '& .MuiDataGrid-cell': {
    color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.65)'
  },
  '& .MuiPaginationItem-root': {
    borderRadius: 0
  },
  '& .MuiDataGrid-toolbarContainer, .MuiButton-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.customColors.brandBlack
  },
  '& .MuiDataGrid-toolbarContainer .MuiButton-root:hover': {
    color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandBlue : theme.palette.customColors.brandBlue
  },
  ...customCheckbox(theme),
  ...customDataGridPanel(theme)
}))

const columns = [
  { field: 'id', headerName: 'ID', flex: 0.02, minWidth: 10 },
  {
    field: 'name',
    headerName: 'Service Name',
    type: 'string',
    flex: 0.02,
    minWidth: 10,
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
    field: 'type',
    headerName: 'Service Status',
    type: 'string',
    flex: 0.04,
    minWidth: 10,
    renderCell: params => {
      const { row } = params

      let color = 'success'
      const status = row.status.toLowerCase()

      if (status == 'failed') {
        color = 'error'
      } else if (status == 'pending') {
        color = 'warning'
      } else if (status == 'stopped') {
        color = 'info'
      }

      return (
        <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
          {row.type === 'container' ? (
            <ServiceCustomChip
              size='medium'
              skin='light'
              color={color}
              label={status}
              icon='mdi:docker'
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize', width: '80px' } }}
            />
          ) : row.type === 'workflow' ? (
            <ServiceCustomChip
              size='medium'
              skin='light'
              color={color}
              label={status}
              icon='mdi:workflow'
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize', width: '80px' } }}
            />
          ) : row.type === 'fabric' ? (
            <ServiceCustomChip
              size='medium'
              skin='light'
              color={color}
              label={status}
              icon='mdi:alpha-f-circle'
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize', width: '80px' } }}
            />
          ) : (
            <ServiceCustomChip
              size='medium'
              skin='light'
              color={color}
              label='unknown'
              icon='mdi:default-icon'
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize', width: '80px' } }}
            />
          )}
        </Stack>
      )
    }
  },
  {
    field: 'lastStarted',
    headerName: 'Last Started',
    type: 'string',
    flex: 0.1,
    minWidth: 10,
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {row.lastStarted}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  {
    field: 'actions',
    headerName: 'Actions',
    type: 'string',
    flex: 0.1,
    minWidth: 10,
    renderCell: params => {
      return (
        <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
          <IconButton size='small' title='Clear' aria-label='Clear' onClick={null}>
            <Icon icon='mdi:play' />
          </IconButton>
          <IconButton size='small' title='Clear' aria-label='Clear' onClick={null}>
            <Icon icon='mdi:stop' />
          </IconButton>
          <IconButton size='small' title='Clear' aria-label='Clear' onClick={null}>
            <Icon icon='mdi:restart' />
          </IconButton>
        </Stack>
      )
    }
  }
]

const ServicesDataGrid = () => {
  const { data: services, isLoading } = useQuery({ queryKey: ['services'], queryFn: fetchServices })

  return (
    <div style={{ height: 900, width: '100%' }}>
      <EricssonDataGrid
        rows={services || []}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        slots={{
          toolbar: GridToolbar
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true
          }
        }}
        loading={isLoading}
      />
    </div>
  )
}

export default ServicesDataGrid
