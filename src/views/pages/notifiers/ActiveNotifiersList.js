// ** React Imports
import { useState, useContext, useEffect, useCallback, forwardRef } from 'react'
import Link from 'next/link'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { useSession } from 'next-auth/react'
import themeConfig from 'src/configs/themeConfig'
import { styled, useTheme } from '@mui/material/styles'
import { atom, useAtom, useSetAtom } from 'jotai'

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
import { notifierIdsAtom, notifiersAtom, refetchNotifierTriggerAtom } from 'src/lib/atoms'
import UpdateNotifierWizard from 'src/views/pages/notifiers/forms/UpdateNotifierWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

// import NotifierDetailPanel from 'src/views/pages/notifiers/NotifierDetailPanel'

function loadServerRows(page, pageSize, data) {
  return new Promise(resolve => {
    resolve(data.slice(page * pageSize, (page + 1) * pageSize))
  })
}

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

const ActiveNotifiersList = props => {
  const ability = useContext(AbilityContext)
  const dgApiRef = useGridApiRef()
  const session = useSession()
  const { t } = useTranslation()
  const theme = useTheme()

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [rowSelectionModel, setRowSelectionModel] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [rowCountState, setRowCountState] = useState(rowCount)
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }])

  const [searchValue, setSearchValue] = useState('')
  const [pinnedColumns, setPinnedColumns] = useState({})
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [runRefresh, setRunRefresh] = useState(false)
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])
  const [notifierIds, setNotifierIds] = useAtom(notifierIdsAtom)
  const [notifiers, setNotifiers] = useAtom(notifiersAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchNotifierTriggerAtom)
  const [filterMode, setFilterMode] = useState('client')
  const [sortingMode, setSortingMode] = useState('client')
  const [paginationMode, setPaginationMode] = useState('client')

  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [disableDialog, setDisableDialog] = useState(false)
  const [scheduleDialog, setScheduleDialog] = useState(false)
  const [runDialog, setRunDialog] = useState(false)
  const [currentNotifier, setCurrentNotifier] = useState(null)

  // const getDetailPanelContent = useCallback(({ row }) => <NotifierDetailPanel row={row} />, [])
  // const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  const columns = [
    {
      flex: 0.02,
      field: 'id',
      headerName: t('Identifier')
    },
    {
      flex: 0.03,
      field: 'name',
      headerName: t('Name'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.name?.toUpperCase()} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.name?.toUpperCase()}
              </Typography>
              <Typography
                title={row?.id}
                noWrap
                overflow={'hidden'}
                textoverflow={'ellipsis'}
                variant='caption'
                sx={{
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandBlue
                      : theme.palette.customColors.brandYellow
                }}
              >
                {row?.id}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 100,
      field: 'type',
      headerName: t('Type'),
      renderCell: params => {
        const { row } = params

        let color = theme.palette.mode === 'light' ? 'secondary' : 'secondary'
        let label = 'UNKN'
        let iconimage = 'mdi:bell-outline'
        if (row?.type?.toLowerCase() === 'email') {
          label = 'EMAIL'
          iconimage = 'mdi:email'
        } else if (row?.type?.toLowerCase() === 'webhook') {
          label = 'WEBHOOK'
          iconimage = 'mdi:webhook'
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                overflow: 'hidden',
                textoverflow: 'ellipsis'
              }}
            >
              <CustomChip
                title={label}
                overflow='hidden'
                textoverflow='ellipsis'
                rounded
                size='medium'
                skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                label={label || 'UNKN'}
                color={color}
                icon={<Icon icon={iconimage} />}
                sx={{
                  '& .MuiChip-label': { textTransform: 'capitalize' },
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandWhite
                      : theme.palette.customColors.brandWhite,
                  width: '150px'
                }}
              />
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 100,
      field: 'description',
      headerName: t('Description'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.description} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.description}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 60,
      field: 'status',
      headerName: t('Status'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'secondary'
        let label = 'UNKNOWN'
        let skin = theme.palette.mode === 'dark' ? 'light' : 'dark'
        if (row?.status?.toLowerCase() === 'enabled') {
          color = 'success'
          label = 'ENABLED'
        } else if (row?.status?.toLowerCase() === 'disabled') {
          color = 'error'
          label = 'DISABLED'
        } else {
          skin = 'dark'
          color = 'secondary'
          label = 'UNKNOWN'
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                overflow: 'hidden',
                textoverflow: 'ellipsis'
              }}
            >
              <CustomChip
                title={label}
                overflow='hidden'
                textoverflow='ellipsis'
                rounded
                size='medium'
                skin={skin}
                label={label || 'UNKNOWN'}
                color={color}
                sx={{
                  '& .MuiChip-label': { textTransform: 'capitalize' },
                  width: '120px'
                }}
              />
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 60,
      field: 'createdAtTime',
      headerName: t('Created At'),
      renderCell: params => {
        const { row } = params

        const timezone = session?.data?.user?.timezone || 'US/Eastern'

        const humanReadableDate = formatInTimeZone(
          utcToZonedTime(parseISO(row?.created_at), timezone),
          timezone,
          'MMM d, yyyy, h:mm:ss aa zzz'
        )

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
            <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={humanReadableDate} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {humanReadableDate}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 60,
      field: 'updatedAtTime',
      headerName: t('Updated At'),
      renderCell: params => {
        const { row } = params

        const timezone = session?.data?.user?.timezone || 'US/Eastern'

        const humanReadableDate = formatInTimeZone(
          utcToZonedTime(parseISO(row?.modified_at), timezone),
          timezone,
          'MMM d, yyyy, h:mm:ss aa zzz'
        )

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
            <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={humanReadableDate} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
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
      type: 'string',
      flex: 0.02,
      minWidth: 200,
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
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton
                size='small'
                title={row?.status?.toLowerCase() === 'enabled' ? 'Disable Notifier' : 'Enable Notifier'}
                aria-label={row?.status?.toLowerCase() === 'enabled' ? 'Disable Notifier' : 'Enable Notifier'}
                color={row?.status?.toLowerCase() === 'enabled' ? 'success' : 'secondary'}
                onClick={() => {
                  setCurrentNotifier(row)
                  setDisableDialog(true)
                }}
              >
                <Icon icon={row?.status?.toLowerCase() === 'enabled' ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} />
              </IconButton>
              <IconButton
                size='small'
                title='Edit Notifier'
                color='secondary'
                aria-label='Edit Notifier'
                onClick={() => {
                  setCurrentNotifier(row)
                  setEditDialog(true)
                }}
              >
                <Icon icon='mdi:edit' />
              </IconButton>
              <IconButton
                size='small'
                title='Delete Notifier'
                aria-label='Delete Notifier'
                color='error'
                onClick={() => {
                  setCurrentNotifier(row)
                  setDeleteDialog(true)
                }}
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

  const handleDisableDialogClose = () => {
    setDisableDialog(false)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false)
  }

  const handleScheduleDialogClose = () => {
    setScheduleDialog(false)
  }

  const handleRunDialogClose = () => {
    setRunDialog(false)
  }

  const EditDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='lg'
        scroll='body'
        open={editDialog}
        onClose={handleUpdateDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentNotifier?.name?.toUpperCase() ?? ''}
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
              {currentNotifier?.id ?? ''}
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
              Edit Notifier Information
            </Typography>
            <Typography variant='body2'>Updates to notifier information will be effective immediately.</Typography>
          </Box>
          {currentNotifier && (
            <UpdateNotifierWizard
              currentNotifier={currentNotifier}
              rows={rows}
              setRows={setRows}
              onClose={handleUpdateDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    )
  }

  const DeleteDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={deleteDialog}
        onClose={handleDeleteDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentNotifier?.name?.toUpperCase() ?? ''}
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
              {currentNotifier?.id ?? ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
            size='small'
            onClick={() => handleDeleteDialogClose()}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Stack direction='row' spacing={2} justifyContent='center' alignContent='center'>
              <Box>
                <img src='/images/warning.png' alt='warning' width='64' height='64' />
              </Box>
              <Box>
                <Typography variant='h5' justifyContent='center' alignContent='center'>
                  Please confirm that you want to delete this notifier.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' sx={{ mr: 1 }} onClick={handleDeleteDialogSubmit} color='primary'>
            Delete
          </Button>
          <Button variant='outlined' onClick={handleDeleteDialogClose} color='secondary'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const DisableDialog = () => {
    const isNotifierActive = currentNotifier?.status?.toLowerCase() === 'enabled'

    const dialogTitleText = isNotifierActive ? 'Please confirm disable of ' : 'Please confirm enable of '

    const actionButtonText = isNotifierActive ? 'Disable' : 'Enable'

    return (
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={disableDialog}
        onClose={handleDisableDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentNotifier?.name?.toUpperCase() ?? ''}
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
              {currentNotifier?.id ?? ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
            size='small'
            onClick={() => handleDisableDialogClose()}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Stack direction='row' spacing={2} justifyContent='center' alignContent='center'>
              <Box>
                <img src='/images/warning.png' alt='warning' width='64' height='64' />
              </Box>
              <Box>
                <Typography variant='h5' justifyContent='center' alignContent='center'>
                  {dialogTitleText}
                  {currentNotifier?.name}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' sx={{ mr: 1 }} onClick={handleDisableDialogSubmit} color='primary'>
            {actionButtonText}
          </Button>
          <Button variant='outlined' onClick={handleDisableDialogClose} color='secondary'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const handleDisableDialogSubmit = async () => {
    const isCurrentlyActive = currentNotifier?.status === 'enabled'
    const notifierId = currentNotifier?.id

    if (!notifierId) {
      console.error('Notifier ID is undefined')
      toast.error('Notifier ID is undefined or invalid')

      return
    }

    const apiToken = session?.data?.user?.apiToken

    const endpoint = isCurrentlyActive ? '/api/notifiers/disable' : '/api/notifiers/enable'

    try {
      const response = await axios.post(
        endpoint,
        [notifierId], // Send the list of IDs
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200) {
        const newStatus = isCurrentlyActive ? 'disabled' : 'enabled'
        const updatedRows = rows.map(row => (row.id === notifierId ? { ...row, status: newStatus } : row))
        setRows(updatedRows)

        toast.success(`Notifier ${newStatus === 'enabled' ? 'Enabled' : 'Disabled'}`)
      } else {
        toast.error(`Failed to ${isCurrentlyActive ? 'Disable' : 'Enable'} Notifier`)
      }
    } catch (error) {
      console.error(`Failed to ${isCurrentlyActive ? 'Disable' : 'Enable'} Notifier`, error)
      toast.error(`Failed to ${isCurrentlyActive ? 'Disable' : 'Enable'} Notifier`)
    }

    setDisableDialog(false)
  }

  const handleDeleteDialogSubmit = async () => {
    try {
      const apiToken = session?.data?.user?.apiToken

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`
      }

      const endpoint = `/api/notifiers/delete/${currentNotifier.id}`

      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentNotifier.id)

        setRows(updatedRows)
        setDeleteDialog(false)

        toast.success('Successfully deleted Notifier')

        setTimeout(() => {
          setRefetchTrigger(Date.now())
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to delete Notifier', error)
      toast.error('Failed to delete Notifier')
    }
  }

  useEffect(() => {
    setRowSelectionModel(notifierIds)
  }, [notifierIds])

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async filterModel => {
      let requestCompleted = false

      setLoading(true)

      const timeoutId = setTimeout(() => {
        if (!requestCompleted) {
          setLoading(false)

          setRows([])
        }
      }, 20000)

      try {
        const response = await axios.get('/api/notifiers', {
          params: {
            sort: sortModel[0]?.sort || 'asc',
            column: sortModel[0]?.field || 'name',
            skip: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            filter: JSON.stringify(filterModel)
          },
          timeout: 10000
        })

        setRowCount(response.data.total_records)
        setRows(response.data.records)
        props.set_total(response.data.total_records)
        setNotifiers(response.data.records)
      } catch (error) {
        console.error('Failed to fetch notifiers:', error)
        toast.error('Failed to fetch notifiers')
      } finally {
        requestCompleted = true
        setLoading(false)
        clearTimeout(timeoutId)
        setRunFilterQuery(false)
        setRunRefresh(false)
      }

      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel, setNotifiers, setRows]
  )

  useEffect(() => {
    if (!runFilterQuery) {
      fetchData()
    }

    const intervalId = setInterval(fetchData, 300000)

    return () => clearInterval(intervalId)
  }, [fetchData, refetchTrigger, runFilterQuery])

  useEffect(() => {
    if (runFilterQuery && filterModel.items.length > 0) {
      if (filterMode === 'server') {
        fetchData(filterModel)
      } else {
      }
      setRunFilterQueryCount(prevRunFilterQueryCount => (prevRunFilterQueryCount += 1))
    } else if (runFilterQuery && filterModel.items.length === 0 && runFilterQueryCount > 0) {
      if (filterMode === 'server') {
        fetchData(filterModel)
      } else {
      }
      setRunFilterQueryCount(0)
    } else {
      console.log('Conditions not met', { itemsLength: filterModel.items.length, runFilterQuery })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModel, runFilterQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData, refetchTrigger])

  useEffect(() => {
    if (runRefresh) {
      fetchData()
    }

    return () => {
      runRefresh && setRunRefresh(false)
    }
  }, [fetchData, runRefresh])

  useEffect(() => {
    if (sortingMode === 'server') {
      fetchData()
    } else {
      const column = sortModel[0]?.field
      const sort = sortModel[0]?.sort

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

  const handleAction = event => {
    setAction(event.target.value)
  }

  const handleSearch = value => {
    setSearchValue(value)
    const searchRegex = new RegExp(escapeRegExp(value), 'i')

    const filteredRows = rows.filter(row => {
      const searchFields = ['id', 'name', 'status', 'type', 'description']

      return searchFields.some(field => {
        const fieldValue = getNestedValue(row, field)

        return fieldValue !== null && fieldValue !== undefined && searchRegex.test(fieldValue.toString())
      })
    })

    if (value.length) {
      setFilteredRows(filteredRows)
      setRowCount(filteredRows.length)
      props.set_total(filteredRows.length)
    } else {
      setFilteredRows([])
      setRowCount(rows.length)
      props.set_total(rows.length)
    }
  }

  const handleRowSelection = newRowSelectionModel => {
    const addedIds = newRowSelectionModel.filter(id => !rowSelectionModel.includes(id))

    addedIds.forEach(id => {
      const row = rows.find(r => r.id === id)
    })

    setRowSelectionModel(newRowSelectionModel)

    setNotifierIds(newRowSelectionModel)
  }

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
          localeText={{
            toolbarColumns: t('Columns'),
            toolbarFilters: t('Filters')
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                createdAtTime: true,
                id: false,
                organization: false
              }
            }
          }}
          autoHeight={true}
          rows={filteredRows.length ? filteredRows : rows}
          apiRef={dgApiRef}
          rowCount={rowCountState}
          columns={columns}
          checkboxSelection={true}
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
              message: 'No Notifiers found'
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
              setRunFilterQuery,
              showButtons: false,
              showexport: true,
              showRefresh: true,
              setRunRefresh
            },
            columnsManagement: {
              getTogglableColumns,
              disableShowHideToggle: false,
              disableResetButton: false
            },
            columnsPanel: {
              sx: {
                '& .MuiCheckbox-root': {
                  color:
                    theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main,
                  '&.Mui-checked': {
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main
                  }
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main
                    }
                  }
                },
                '& .MuiInputLabel-outlined': {
                  '&.Mui-focused': {
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main
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
                    backgroundColor: 'rgba(0, 0, 255, 0.04)',
                    borderColor:
                      theme.palette.mode == 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main,
                    color:
                      theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
                  }
                },
                '& .MuiDataGrid-columnsManagementFooter .MuiButton-outlined:first-of-type': {
                  mr: 2
                }
              }
            },
            filterPanel: {
              logicOperators: [GridLogicOperator.And, GridLogicOperator.Or],
              columnsSort: 'asc',
              filterFormProps: {
                logicOperatorInputProps: {
                  variant: 'outlined',
                  size: 'small'
                },
                columnInputProps: {
                  variant: 'outlined',
                  size: 'small',
                  sx: {
                    mt: 'auto',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main
                        }
                      }
                    },
                    '& .MuiInputLabel-outlined': {
                      '&.Mui-focused': {
                        color:
                          theme.palette.mode === 'dark'
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
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main
                        }
                      }
                    },
                    '& .MuiInputLabel-outlined': {
                      '&.Mui-focused': {
                        color:
                          theme.palette.mode === 'dark'
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
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor:
                              theme.palette.mode === 'dark'
                                ? theme.palette.customColors.brandYellow
                                : theme.palette.primary.main
                          }
                        }
                      },
                      '& .MuiInputLabel-outlined': {
                        '&.Mui-focused': {
                          color:
                            theme.palette.mode === 'dark'
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
                    backgroundColor: 'rgba(0, 0, 255, 0.04)',
                    borderColor:
                      theme.palette.mode == 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main,
                    color:
                      theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
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
        <DisableDialog />
        <EditDialog />
        <DeleteDialog />
      </Card>
    </Box>
  )
}

export default ActiveNotifiersList
