// ** React Imports
import { useState, useContext, useEffect, useCallback, forwardRef } from 'react'
import Link from 'next/link'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { useSession } from 'next-auth/react'
import themeConfig from 'src/configs/themeConfig'
import { styled, useTheme } from '@mui/material/styles'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Backdrop from '@mui/material/Backdrop'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import { DataGridPro, GridLoadingOverlay, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Paper from '@mui/material/Paper'
import OutlinedInput from '@mui/material/OutlinedInput'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import LinearProgress from '@mui/material/LinearProgress'
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Fade from '@mui/material/Fade'

// ** ThirdParty Components
import axios from 'axios'

import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { parseISO, formatDistance } from 'date-fns'
import { format, zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz'
import { useTranslation } from 'react-i18next'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { escapeRegExp, getNestedValue } from 'src/lib/utils'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { CustomDataGrid, TabList } from 'src/lib/styled-components.js'
import UpdateDatacenterWizard from 'src/views/pages/inventory/forms/UpdateDatacenterWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

import { datacentersAtom, refetchDatacenterTriggerAtom, timezoneAtom } from 'src/lib/atoms'
import { useAtom } from 'jotai'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const StyledLink = styled(Link)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  textDecoration: 'none',
  color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.customColors.brandBlack,
  '&:hover': {
    color:
      theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.customColors.brandWhite
  }
}))

const userRoleObj = {
  admin: { icon: 'mdi:cog-outline', color: 'error.main' },
  regular: { icon: 'mdi:account-outline', color: 'info.main' },
  unknown: { icon: 'mdi:account-question-outline', color: 'warning.main' }
}

const DatacentersList = props => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const dgApiRef = useGridApiRef()
  const session = useSession()
  const { t } = useTranslation()
  const theme = useTheme()

  // ** Data Grid state
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [rowSelectionModel, setRowSelectionModel] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [rowCountState, setRowCountState] = useState(rowCount)
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }])

  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [pinnedColumns, setPinnedColumns] = useState({})
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])

  // ** Dialog
  const [statusDialog, setStatusDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [deactivateDialog, setDeactivateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [currentDatacenter, setCurrentDatacenter] = useState(null)
  const [datacenters, setDatacenters] = useAtom(datacentersAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchDatacenterTriggerAtom)
  const [filterMode, setFilterMode] = useState('client')
  const [sortingMode, setSortingMode] = useState('client')
  const [paginationMode, setPaginationMode] = useState('client')

  const [timezone] = useAtom(timezoneAtom)
  const editmode = false

  // column definitions
  const columns = [
    {
      flex: 0.02,
      field: 'id',
      headerName: t('Identifier'),
      renderCell: params => {
        const { row } = params

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow='hidden' textOverflow='ellipsis' title={row.id}>
                {row.id}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.035,
      minWidth: 100,
      field: 'name',
      editable: editmode,
      headerName: t('Datacenter'),
      renderCell: params => {
        const { row } = params

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow='hidden' textOverflow='ellipsis' title={row.name?.toUpperCase()}>
                {row.name?.toUpperCase()}
              </Typography>
              <Typography
                noWrap
                variant='caption'
                sx={{
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandBlue
                      : theme.palette.customColors.brandYellow
                }}
                title={row.id}
              >
                {row.id}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.025,
      field: 'environments',
      editable: editmode,
      headerName: t('Environments'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'info'
        let label = `ENVIRONMENTS (${row?.environment_count || 0})`

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <CustomChip
              rounded
              size='small'
              skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
              label={label || 'UNKN'}
              color={color}
              icon={<Icon icon='mdi:office-building-cog' />}
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
            />
          </Box>
        )
      }
    },
    {
      flex: 0.025,
      field: 'active_servers',
      editable: editmode,
      headerName: t('Active Servers'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'success'
        let label = `ACTIVE (${row?.active_servers || 0})`

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <CustomChip
              rounded
              size='small'
              skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
              label={label || 'UNKN'}
              color={color}
              icon={<Icon icon='mdi:server' />}
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
            />
          </Box>
        )
      }
    },
    {
      flex: 0.025,
      field: 'inactive_servers',
      editable: editmode,
      headerName: t('In-Active Servers'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'error'
        let label = `IN-ACTIVE (${row?.inactive_servers || 0})`

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <CustomChip
              rounded
              size='small'
              skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
              label={label || 'UNKN'}
              color={color}
              icon={<Icon icon='mdi:server-off' />}
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
            />
          </Box>
        )
      }
    },
    {
      flex: 0.05,
      minWidth: 100,
      field: 'location',
      editable: editmode,
      headerName: t('Location'),
      renderCell: params => {
        const { row } = params

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow='hidden' textOverflow='ellipsis' title={row.location?.toUpperCase()}>
                {row.location?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.05,
      minWidth: 250,
      field: 'createdAtTime',
      editable: editmode,
      headerName: t('Created At'),
      renderCell: params => {
        const { row } = params

        let humanReadableDate = ''

        if (row.created_at) {
          humanReadableDate = formatInTimeZone(
            parseISO(row.created_at),
            timezone || 'UTC',
            'MMM d, yyyy, h:mm:ss aa zzz'
          )
        }

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow='hidden' textOverflow='ellipsis' title={humanReadableDate}>
                {humanReadableDate}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.05,
      minWidth: 100,
      field: 'updatedAtTime',
      editable: editmode,
      headerName: t('Updated At'),
      renderCell: params => {
        const { row } = params

        let humanReadableDate = ''

        if (row.modified_at) {
          humanReadableDate = formatInTimeZone(
            parseISO(row.modified_at),
            timezone || 'UTC',
            'MMM d, yyyy, h:mm:ss aa zzz'
          )
        }

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow='hidden' textOverflow='ellipsis' title={humanReadableDate}>
                {humanReadableDate}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'actions',
      headerName: t('Actions'),
      align: 'left',
      flex: 0.025,
      minWidth: 150,
      renderCell: params => {
        const { row } = params
        const isActive = row.active_servers > 0 // Assuming active datacenter has active servers

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton
                size='small'
                title={isActive ? 'Deactivate' : 'Activate'}
                aria-label={isActive ? 'Deactivate' : 'Activate'}
                color={isActive ? 'success' : 'warning'}
                onClick={() => {
                  setCurrentDatacenter(params.row)
                  setStatusDialog(true)
                }}
                disabled={!ability.can('update', 'datacenters')}
              >
                <Icon icon={isActive ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off'} />
              </IconButton>
              <IconButton
                size='small'
                title='Edit'
                aria-label='Edit'
                onClick={() => {
                  setCurrentDatacenter(params.row)
                  setEditDialog(true)
                }}
                disabled={!ability.can('update', 'datacenters')}
              >
                <Icon icon='mdi:edit' />
              </IconButton>
              <IconButton
                size='small'
                title='Delete Datacenter'
                aria-label='Delete Datacenter'
                color='error'
                onClick={() => {
                  setCurrentDatacenter(params.row)
                  setDeleteDialog(true)
                }}
                disabled={!ability.can('delete', 'datacenters')}
              >
                <Icon icon='mdi:delete-forever' />
              </IconButton>
            </Box>
          </Box>
        )
      }
    }
  ]

  const handleUpdateDialogClose = () => {
    setEditDialog(false)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false)
  }

  // Function to handle dialog submission
  const handleStatusDialogSubmit = async () => {
    try {
      const isActive = currentDatacenter.active_servers > 0 // Determine current status
      const apiToken = session?.data?.user?.apiToken

      const headers = {
        Accept: 'application/json'
      }

      const endpoint = isActive
        ? `/api/inventory/datacenters/disable/${currentDatacenter.id}`
        : `/api/inventory/datacenters/enable/${currentDatacenter.id}`

      const response = await axios.post(endpoint, null, { headers })

      if (response.status === 200) {
        // Update the row data with the response
        const updatedDatacenter = response.data
        setRows(prevRows => prevRows.map(row => (row.id === updatedDatacenter.id ? updatedDatacenter : row)))
        setStatusDialog(false)
        toast.success(`Successfully ${isActive ? 'deactivated' : 'activated'} datacenter`)
      }
    } catch (error) {
      console.error('Failed to update datacenter status:', error)
      toast.error('Failed to update datacenter status')
    }
  }

  // Status Dialog Component
  const StatusDialog = () => {
    const isActive = currentDatacenter?.active_servers > 0 // Determine current status

    return (
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        TransitionComponent={Transition}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {t('Confirm Status Change')}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.warning' }}>
                {currentDatacenter?.name?.toUpperCase()}
              </Typography>
            </Box>
            <IconButton size='small' onClick={() => setStatusDialog(false)} aria-label='close'>
              <Icon icon='mdi:close' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='h6' sx={{ textAlign: 'center' }}>
            {t(`Confirm you want to ${isActive ? 'deactivate' : 'activate'} this datacenter?`)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleStatusDialogSubmit}
            color={isActive ? 'warning' : 'success'}
            autoFocus
            startIcon={<Icon icon={isActive ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} />}
          >
            {t(isActive ? 'Deactivate' : 'Activate')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={() => setStatusDialog(false)}
            color='secondary'
            startIcon={<Icon icon='mdi:close' />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const EditDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={editDialog}
        onClose={handleUpdateDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentDatacenter?.name?.toUpperCase() ?? ''}
            </Typography>
            <Typography
              noWrap
              variant='caption'
              sx={{
                color:
                  theme.palette.mode === 'light'
                    ? theme.palette.customColors.brandBlack
                    : theme.palette.customColors.brandYellow
              }}
            >
              {currentDatacenter?.id ?? ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
            size='small'
            onClick={() => handleUpdateDialogClose()}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              Edit Datacenter Information
            </Typography>
            <Typography variant='body2'>Updates to datacenter information will be effective immediately.</Typography>
          </Box>
          <UpdateDatacenterWizard
            currentDatacenter={currentDatacenter}
            rows={rows}
            setRows={setRows}
            onClose={handleUpdateDialogClose}
          />
        </DialogContent>
      </Dialog>
    )
  }

  const DeleteDialog = () => {
    return (
      <Dialog
        open={deleteDialog}
        onClose={handleDeleteDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('Confirm Deletion')}
            </Typography>
            <IconButton size='small' onClick={handleDeleteDialogClose} aria-label='close'>
              <Icon icon='mdi:close' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Stack direction='row' spacing={2} justifyContent='center' alignItems='center'>
              <Box>
                <img src='/images/warning.png' alt='warning' width='32' height='32' />
              </Box>
              <Box>
                <Typography variant='h6'>{t('Confirm you want to delete this datacenter?')}</Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleDeleteDialogSubmit}
            color='error'
            autoFocus
            startIcon={<Icon icon='mdi:delete-forever' />}
          >
            {t('Delete')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleDeleteDialogClose}
            color='secondary'
            startIcon={<Icon icon='mdi:close' />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const handleDeleteDialogSubmit = async () => {
    try {
      const apiToken = session?.data?.user?.apiToken

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
      }

      const endpoint = `/api/inventory/datacenters/${currentDatacenter.id}`
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentDatacenter.id)

        setRows(updatedRows)
        setDeleteDialog(false)

        // props.set_total(props.total - 1)

        setRefetchTrigger(Date.now())

        toast.success('Successfully deleted Datacenter')
      }
    } catch (error) {
      console.error('Failed to delete Datacenter', error)
      toast.error('Failed to delete Datacenter')
    }
  }

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async (sort, sortColumn, filterModel) => {
      setLoading(true)
      await axios
        .get('/api/inventory/datacenters', {
          params: {}
        })
        .then(res => {
          setRowCount(res.data.total)
          setRows(res.data.rows)
          props.set_total(res.data.total)
          setDatacenters(res.data.rows)
        })

      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setDatacenters, setRows]
  )

  // Add new fetch functions for other tabs
  const fetchAllCounts = useCallback(async () => {
    try {
      // Fetch all counts in parallel
      const [components, environments, servers, subcomponents] = await Promise.all([
        axios.get('/api/inventory/components', { params: {} }),
        axios.get('/api/inventory/environments', { params: {} }),
        axios.get('/api/inventory/servers', { params: {} }),
        axios.get('/api/inventory/subcomponents', { params: {} })
      ])

      // Set counts for other tabs
      props.set_components_total(components.data.total)
      props.set_environments_total(environments.data.total)
      props.set_servers_total(servers.data.total)
      props.set_subcomponents_total(subcomponents.data.total)
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }, [props])

  useEffect(() => {
    fetchData()
    fetchAllCounts()
  }, [fetchData, refetchTrigger, fetchAllCounts])

  // Trigger based on sort
  useEffect(() => {
    console.log('Effect Run:', { sortModel, runFilterQuery })
    console.log('Sort Model:', JSON.stringify(sortModel))

    if (sortingMode === 'server') {
      // server side sorting
    } else {
      // client side sorting
      const column = sortModel[0]?.field
      const sort = sortModel[0]?.sort

      console.log('Column:', column)
      console.log('Sort:', sort)

      console.log('Rows:', rows)

      if (filteredRows.length > 0) {
        const dataAsc = [...filteredRows].sort((a, b) => (a[column] < b[column] ? -1 : 1))
        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()
        setFilteredRows(dataToFilter)
      } else {
        const dataAsc = [...rows].sort((a, b) => (a[column] < b[column] ? -1 : 1))
        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()
        setRows(dataToFilter)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel])

  // Trigger based on filter
  useEffect(() => {
    console.log('Effect Run:', { itemsLength: filterModel.items.length, runFilterQuery })
    console.log('Filter Model:', JSON.stringify(filterModel))

    if (runFilterQuery && filterModel.items.length > 0) {
      if (filterMode === 'server') {
        const sort = sortModel[0]?.sort
        const sortColumn = sortModel[0]?.field
        fetchData(sort, sortColumn, filterModel)
      } else {
        // client side filtering
      }
      setRunFilterQueryCount(prevRunFilterQueryCount => (prevRunFilterQueryCount += 1))
    } else if (runFilterQuery && filterModel.items.length === 0 && runFilterQueryCount > 0) {
      if (filterMode === 'server') {
        fetchData(sort, sortColumn, filterModel)
      } else {
        // client side filtering
      }
      setRunFilterQueryCount(0)
    } else {
      console.log('Conditions not met', { itemsLength: filterModel.items.length, runFilterQuery })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModel.items.length, runFilterQuery])

  const handleAction = event => {
    setAction(event.target.value)
  }

  const handleSearch = value => {
    console.log('Search Value:', value)

    setSearchValue(value)
    const searchRegex = new RegExp(escapeRegExp(value), 'i')

    const filteredRows = rows.filter(row => {
      console.log('Row:', row)

      // Extend the search to include nested paths
      const searchFields = ['id', 'name']

      return searchFields.some(field => {
        const fieldValue = getNestedValue(row, field)

        // Ensure the fieldValue is a string before calling toString()
        return fieldValue !== null && fieldValue !== undefined && searchRegex.test(fieldValue.toString())
      })
    })

    if (value.length) {
      // console.log('Filtered Rows:', filteredRows)
      setFilteredRows(filteredRows)
      setRowCount(filteredRows.length)
      props.set_total(filteredRows.length)
    } else {
      setFilteredRows([])
      setRowCount(rows.length)
      props.set_total(rows.length)
    }
  }

  const handleRowSelection = rowid => {
    setRowSelectionModel(rowids)
  }

  // Hidden columns
  const hiddenFields = ['id']

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  return (
    <Box>
      <Card sx={{ position: 'relative' }}>
        <CardHeader title={t(props.type)} sx={{ textTransform: 'capitalize' }} />
        <CustomDataGrid
          initialState={{
            columns: {
              columnVisibilityModel: {
                createdAtTime: true,
                id: false
              }
            }
          }}
          autoHeight={true}
          rows={filteredRows.length ? filteredRows : rows}
          apiRef={dgApiRef}
          rowCount={rowCountState}
          columns={columns}
          checkboxSelection={false}
          disableRowSelectionOnClick
          filterMode={filterMode}
          filterModel={filterModel}
          onFilterModelChange={newFilterModel => setFilterModel(newFilterModel)}
          sortingMode={sortingMode}
          sortModel={sortModel}
          onSortModelChange={newSortModel => setSortModel(newSortModel)}
          pagination={true}
          paginationMode={paginationMode}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={newPage => setPage(newPage)}
          slots={{
            toolbar: ServerSideToolbar,
            noRowsOverlay: NoRowsOverlay,
            noResultsOverlay: NoResultsOverlay,
            loadingOverlay: CustomLoadingOverlay
          }}
          onRowSelectionModelChange={newRowSelectionModel => handleRowSelection(newRowSelectionModel)}
          rowSelectionModel={rowSelectionModel}
          loading={loading}
          keepNonExistentRowsSelected
          slotProps={{
            baseButton: {
              variant: 'outlined'
            },
            panel: {
              anchorEl: isFilterActive ? filterButtonEl : columnsButtonEl
            },
            noRowsOverlay: {
              message: 'No Datacenters found'
            },
            noResultsOverlay: {
              message: 'No Results Found'
            },
            toolbar: {
              value: searchValue,
              clearSearch: () => handleSearch(''),
              onChange: event => handleSearch(event.target.value),
              setColumnsButtonEl,
              setFilterButtonEl,
              setFilterActive,
              showButtons: false,
              showexport: true
            },
            columnsManagement: {
              getTogglableColumns,
              disableShowHideToggle: false,
              disableResetButton: false
            },
            columnsPanel: {
              sx: {
                '& .MuiCheckbox-root': {
                  color: theme.palette.customColors.accent,
                  '&.Mui-checked': {
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main
                  }
                },

                // Target the root of the outlined input
                '& .MuiOutlinedInput-root': {
                  // Apply these styles when the element is focused
                  '&.Mui-focused': {
                    // Target the notched outline specifically
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main
                    }
                  }
                },
                '& .MuiDataGrid-columnsManagementFooter .MuiButton-outlined': {
                  mb: 2,
                  mt: 2,
                  borderColor:
                    theme.palette.mode == 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                  color:
                    theme.palette.mode == 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 255, 0.04)', // Custom background color on hover
                    borderColor: theme.palette.customColors.accent,
                    color: theme.palette.customColors.accent
                  }
                },
                '& .MuiDataGrid-columnsManagementFooter .MuiButton-outlined:first-of-type': {
                  mr: 2
                }
              }
            },
            filterPanel: {
              // Force usage of "And" operator
              logicOperators: [GridLogicOperator.And, GridLogicOperator.Or],

              // Display columns by ascending alphabetical order
              columnsSort: 'asc',
              filterFormProps: {
                // Customize inputs by passing props
                logicOperatorInputProps: {
                  variant: 'outlined',
                  size: 'small'
                },
                columnInputProps: {
                  variant: 'outlined',
                  size: 'small',
                  sx: {
                    mt: 'auto',

                    // Target the root style of the outlined input
                    '& .MuiOutlinedInput-root': {
                      // Apply styles when focused
                      '&.Mui-focused': {
                        // Target the notched outline specifically
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main
                        }
                      }
                    },

                    // Target the label for color change
                    '& .MuiInputLabel-outlined': {
                      // Apply styles when focused
                      '&.Mui-focused': {
                        color:
                          theme.palette.mode == 'dark'
                            ? theme.palette.customColors.brandYellow
                            : theme.palette.primary.main
                      }
                    }
                  }
                },
                operatorInputProps: {
                  variant: 'outlined',
                  size: 'small',
                  sx: {
                    mt: 'auto',

                    // Target the root style of the outlined input
                    '& .MuiOutlinedInput-root': {
                      // Apply styles when focused
                      '&.Mui-focused': {
                        // Target the notched outline specifically
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main
                        }
                      }
                    },

                    // Target the label for color change
                    '& .MuiInputLabel-outlined': {
                      // Apply styles when focused
                      '&.Mui-focused': {
                        color:
                          theme.palette.mode == 'dark'
                            ? theme.palette.customColors.brandYellow
                            : theme.palette.primary.main
                      }
                    }
                  }
                },
                valueInputProps: {
                  InputComponentProps: {
                    variant: 'outlined',
                    size: 'small',
                    sx: {
                      // Target the root of the outlined input
                      '& .MuiOutlinedInput-root': {
                        // Apply these styles when the element is focused
                        '&.Mui-focused': {
                          // Target the notched outline specifically
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor:
                              theme.palette.mode == 'dark'
                                ? theme.palette.customColors.brandYellow
                                : theme.palette.primary.main
                          }
                        }
                      },

                      // Target the label for color change
                      '& .MuiInputLabel-outlined': {
                        // Apply styles when focused
                        '&.Mui-focused': {
                          color:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main
                        }
                      }
                    }
                  }
                },
                deleteIconProps: {
                  sx: {
                    '& .MuiSvgIcon-root': { color: '#d32f2f' }
                  }
                }
              },
              sx: {
                // Customize inputs using css selectors
                '& .MuiDataGrid-filterForm': { p: 2 },
                '& .MuiDataGrid-filterForm:nth-of-type(even)': {
                  backgroundColor: theme => (theme.palette.mode === 'dark' ? '#444' : '#f5f5f5')
                },
                '& .MuiDataGrid-filterFormLogicOperatorInput': { mr: 2 },
                '& .MuiDataGrid-filterFormColumnInput': { mr: 2, width: 150 },
                '& .MuiDataGrid-filterFormOperatorInput': { mr: 2 },
                '& .MuiDataGrid-filterFormValueInput': { width: 200 },
                '& .MuiDataGrid-panelFooter .MuiButton-outlined': {
                  mb: 2,
                  borderColor:
                    theme.palette.mode == 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                  color:
                    theme.palette.mode == 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 255, 0.04)', // Custom background color on hover
                    borderColor: theme.palette.customColors.accent,
                    color: theme.palette.customColors.accent
                  }
                },
                '& .MuiDataGrid-panelFooter .MuiButton-outlined:first-of-type': {
                  ml: 2
                },
                '& .MuiDataGrid-panelFooter .MuiButton-outlined:last-of-type': {
                  mr: 2
                }
              }
            }
          }}
        />
        {statusDialog && <StatusDialog />}
        {editDialog && <EditDialog />}
        {deleteDialog && <DeleteDialog />}
      </Card>
    </Box>
  )
}

export default DatacentersList
