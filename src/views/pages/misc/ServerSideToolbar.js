// ** MUI Imports
import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridPrintExportMenuItem,
  useGridApiContext,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector
} from '@mui/x-data-grid-pro'

import MenuItem from '@mui/material/MenuItem'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Fade from '@mui/material/Fade'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import subDays from 'date-fns/subDays'
import startOfWeek from 'date-fns/startOfWeek'
import endOfWeek from 'date-fns/endOfWeek'
import addDays from 'date-fns/addDays'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import addMonths from 'date-fns/addMonths'
import { DateRangePicker } from 'rsuite'
import { endOfDay, startOfDay, subHours } from 'date-fns'

import { useTheme } from '@mui/material/styles'
import { grid } from '@mui/system'
import axios from 'axios'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

const predefinedRanges = [
  {
    label: 'Today',
    value: [new Date(), new Date()],
    placement: 'left'
  },
  {
    label: 'Last 24hrs',
    value: [subHours(new Date(), 23), new Date()],
    placement: 'left'
  },
  {
    label: 'Yesterday',
    value: [addDays(new Date(), -1), addDays(new Date(), -1)],
    placement: 'left'
  },
  {
    label: 'This week',
    value: [startOfWeek(new Date()), endOfWeek(new Date())],
    placement: 'left'
  },
  {
    label: 'Last 7 days',
    value: [subDays(new Date(), 6), new Date()],
    placement: 'left'
  },
  {
    label: 'Last 2 weeks',
    value: [subDays(new Date(), 13), new Date()],
    placement: 'left'
  },
  {
    label: 'Last 30 days',
    value: [subDays(new Date(), 29), new Date()],
    placement: 'left'
  },
  {
    label: 'This month',
    value: [startOfMonth(new Date()), new Date()],
    placement: 'left'
  },
  {
    label: 'Last month',
    value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
    placement: 'left'
  },
  {
    label: 'Yesterday',
    closeOverlay: false,
    value: value => {
      const [start = new Date()] = value || []

      return [addDays(startOfDay(start, {}), -1), addDays(endOfDay(start, {}), -1)]
    },
    appearance: 'default'
  },
  {
    label: 'Last week',
    closeOverlay: false,
    value: value => {
      const [start = new Date()] = value || []

      return [addDays(startOfWeek(start, { weekStartsOn: 0 }), -7), addDays(endOfWeek(start, { weekStartsOn: 0 }), -7)]
    },
    appearance: 'default'
  }
]

function ExcelExportMenuItem(props) {
  const { hideMenu } = props

  const exportToExcel = async () => {
    try {
      // Fetch server data
      const response = await axios.get('/api/inventory/servers')
      const servers = response.data.rows

      // Create a new workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Servers')

      // Define columns
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Hostname', key: 'hostname', width: 25 },
        { header: 'Datacenter', key: 'datacenter_name', width: 25 },
        { header: 'Environment', key: 'environment_name', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Component', key: 'component_name', width: 20 },
        { header: 'Subcomponent', key: 'subcomponent_name', width: 20 },
        { header: 'Metadata', key: 'metadata', width: 50 },
        { header: 'Network Interfaces', key: 'network_interfaces', width: 50 },
        { header: 'Created At', key: 'created_at', width: 20 },
        { header: 'Modified At', key: 'modified_at', width: 20 }
      ]

      // Add rows
      servers.forEach(server => {
        worksheet.addRow({
          ...server,
          metadata: server.metadata.map(meta => `${meta.key}: ${meta.value}`).join('; '),
          network_interfaces: server.network_interfaces.map(ni => `${ni.name} (${ni.ip_address})`).join('; ')
        })
      })

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer()

      // Trigger file download
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'Servers.xlsx'
      )
      console.log('Exporting...')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    }

    // Hide the export menu after the export
    hideMenu?.()
  }

  return <MenuItem onClick={exportToExcel}>Export Excel</MenuItem>
}

const csvOptions = { delimiter: ';' }

const printOptions = { hideFooter: true, hideToolbar: true }

const CustomExportButton = props => {
  return (
    <GridToolbarExportContainer {...props}>
      {/* <GridPrintExportMenuItem option={printOptions} />
      <GridCsvExportMenuItem options={csvOptions} /> */}
      <ExcelExportMenuItem />
    </GridToolbarExportContainer>
  )
}

const CustomToolbar = ({ setColumnsButtonEl, setFilterButtonEl, setFilterActive, ...props }) => {
  return (
    <GridToolbarContainer sx={{ flexWrap: 'nowrap' }}>
      <GridToolbarFilterButton
        ref={setFilterButtonEl}
        componentsProps={{
          button: {
            onClick: () => {
              setFilterActive(true)
            }
          }
        }}
      />
      <GridToolbarColumnsButton
        ref={setColumnsButtonEl}
        onClick={() => {
          setFilterActive(false)
        }}
      />
      {props.showexport ? <CustomExportButton /> : null}
    </GridToolbarContainer>
  )
}

const ServerSideToolbar = ({ showButtons, ...props }) => {
  const theme = useTheme()
  const [openAddDriverDialog, setOpenAddDriverDialog] = useState(false)
  const [openUploadCSVDialog, setOpenUploadCSVDialog] = useState(false)
  const modeDependentColor = theme.palette.mode === 'light' ? 'secondary' : 'primary'

  const { t } = useTranslation()

  // const { tripsRef, breadcrumbsRef, idleEventsRef } = dataGridRefs

  const { afterToday } = DateRangePicker

  const handleAddDriverSubmit = () => {
    // Logic to add the driver
    // Close the dialog afterward
    setOpenAddDriverDialog(false)
  }

  return (
    <Box
      sx={{
        gap: 1,
        display: 'grid',
        gridAutoColumns: '1fr',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
      {showButtons && (
        <Box sx={{ flexWrap: 'nowrap' }}>
          <Button
            size='small'
            variant='contained'
            color={modeDependentColor}
            startIcon={<Icon icon='mdi:account-plus' />}
            onClick={() => setOpenAddDriverDialog(true)}
          >
            Add Driver
          </Button>
          <Button
            size='small'
            variant='outlined'
            color='secondary'
            startIcon={<Icon icon='mdi:file-upload' />}
            onClick={() => setOpenUploadCSVDialog(true)}
            sx={{ ml: 2 }}
          >
            Upload CSV
          </Button>
        </Box>
      )}

      <CustomToolbar
        setColumnsButtonEl={props.setColumnsButtonEl}
        setFilterButtonEl={props.setFilterButtonEl}
        setFilterActive={props.setFilterActive}
        datagridrefs={props.datagridrefs ? props.datagridrefs : null}
        showexport={props.showexport ? props.showexport : false}
        reportId={props.reportId}
        sx={{ gridRow: '1', gridColumn: '6 / 6' }}
      />
      <TextField
        size='small'
        value={props.value}
        onChange={props.onChange}
        placeholder={`${t('Search')}…`}
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 2, display: 'flex' }}>
              <Icon icon='mdi:magnify' fontSize={20} />
            </Box>
          ),
          endAdornment: (
            <IconButton size='small' title='Clear' aria-label='Clear' onClick={props.clearSearch}>
              <Icon icon='mdi:close' fontSize={20} />
            </IconButton>
          )
        }}
        sx={{
          gridRow: '1',
          gridColumn: '6 / 6',
          width: {
            xs: 1,
            sm: 'auto'
          },
          '& .MuiInputBase-root > svg': {
            mr: 2
          }
        }}
      />
      <Dialog open={openAddDriverDialog} onClose={() => setOpenAddDriverDialog(false)}>
        <DialogTitle>Add Driver</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin='dense' label='Driver Name' type='text' fullWidth />
          {/* Add more fields as required */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDriverDialog(false)} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleAddDriverSubmit} color='primary'>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ServerSideToolbar
