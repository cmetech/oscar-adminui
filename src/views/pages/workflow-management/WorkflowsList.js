// ** React Imports
import { useState, useContext, useEffect, useCallback, useRef, useMemo, forwardRef } from 'react'
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
import RunTaskWizard from 'src/views/pages/tasks-management/forms/RunTaskWizard'
import WorkflowDetailPanel from 'src/views/pages/workflow-management/WorkflowDetailPanel'
import { workflowIdsAtom, workflowsAtom, refetchWorkflowTriggerAtom } from 'src/lib/atoms'
import UpdateTaskWizard from 'src/views/pages/tasks-management/forms/UpdateTaskWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

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

const WorkflowsList = props => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const dgApiRef = useGridApiRef()
  const session = useSession()
  const { t } = useTranslation()
  const theme = useTheme()
  const hasRunRef = useRef(false)

  // ** Data Grid state
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [allRows, setAllRows] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [rowSelectionModel, setRowSelectionModel] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [sortModel, setSortModel] = useState([{ field: 'dag_id', sort: 'asc' }])

  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [pinnedColumns, setPinnedColumns] = useState({})
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [runRefresh, setRunRefresh] = useState(false)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])
  const [workflowIds, setWorkflowIds] = useAtom(workflowIdsAtom)
  const [workflows, setWorkflows] = useAtom(workflowsAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchWorkflowTriggerAtom)
  const [filterMode, setFilterMode] = useState('server')
  const [sortingMode, setSortingMode] = useState('server')
  const [paginationMode, setPaginationMode] = useState('server')

  // ** Dialog
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [disableDialog, setDisableDialog] = useState(false)
  const [scheduleDialog, setScheduleDialog] = useState(false)
  const [runDialog, setRunDialog] = useState(false)
  const [currentWorkflow, setCurrentWorkflow] = useState(null)

  const memoizedSortModel = useMemo(() => sortModel, [sortModel]);

  const getDetailPanelContent = useCallback(({ row }) => <WorkflowDetailPanel row={row} />, [])
  const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  // column definitions
  const columns = [
    {
      flex: 0.06,
      field: 'dag_id',
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
              <Typography title={row?.dag_id?.toUpperCase()} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.dag_id?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 100,
      field: 'schedule_interval',
      headerName: t('Schedule Interval'),
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
              <Typography title={row?.schedule_interval?.value} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.schedule_interval?.value}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 100,
      field: 'timetable_description',
      headerName: t('Timetable Description'),
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
              <Typography title={row?.timetable_description} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.timetable_description}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 60,
      field: 'next_dagrun',
      headerName: t('Next Run'),
      renderCell: params => {
        const { row } = params

        const timezone = session?.data?.user?.timezone || 'US/Eastern'

        if (row?.next_dagrun && !isNaN(new Date(row.next_dagrun).getTime())) {
          const humanReadableDate = formatInTimeZone(
            utcToZonedTime(parseISO(row.next_dagrun), timezone),
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
        } else {
          return null
        }
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
        const isPaused = row?.is_paused
        const isActive = row?.is_active

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center', // Ensures vertical centering inside the Box
              justifyContent: 'flex-start',
              width: '100%', // Ensures the Box takes full width of the cell
              height: '100%' // Ensures the Box takes full height of the cell
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton
                size='small'
                title={t('Run Workflow')}
                aria-label={t('Run Workflow')}
                color='warning'
                onClick={() => {
                  setCurrentWorkflow(row)
                  setRunDialog(true)
                }}
                disabled={!isActive || isPaused}
              >
                <Icon icon='mdi:play-circle-outline' />
              </IconButton>
              <IconButton
                size='small'
                title={isActive && !isPaused ? t('Disable Workflow') : t('Enable Workflow')}
                aria-label={isActive && !isPaused ? t('Disable Workflow') : t('Enable Workflow')}
                color={isActive && !isPaused ? 'success' : 'secondary'}
                onClick={() => {
                  setCurrentWorkflow(row)
                  setDisableDialog(true)
                }}
              >
                <Icon icon={isActive && !isPaused ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} />
              </IconButton>
              <IconButton
                size='small'
                title={t('Edit Workflow')}
                color='secondary'
                aria-label={t('Edit Workflow')}
                onClick={() => {
                  setCurrentWorkflow(row)
                  setEditDialog(true)
                }}
              >
                <Icon icon='mdi:edit' />
              </IconButton>
              <IconButton
                size='small'
                title={t('Delete Workflow')}
                aria-label={t('Delete Workflow')}
                color='error'
                onClick={() => {
                  setCurrentWorkflow(row)
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

  // Add this function to get toggleable columns
  const getTogglableColumns = useCallback(() => {
    return columns.filter(column => column.field !== 'actions')
  }, [columns])

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
              {currentWorkflow?.dag_display_name?.toUpperCase() ?? ''}
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
              {currentWorkflow?.dag_id ?? ''}
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
              {t('Edit Workflow Information')}
            </Typography>
            <Typography variant='body2'>{t('Updates to workflow information will be effective immediately.')}</Typography>
          </Box>
          {currentWorkflow && (
            <UpdateTaskWizard
              currentWorkflow={currentWorkflow}
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
        open={deleteDialog}
        onClose={handleDeleteDialogClose}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('Confirm Deletion')}
            </Typography>
            <IconButton
              size='small'
              onClick={handleDeleteDialogClose}
              aria-label="close"
            >
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
                <Typography variant='h6'>
                  {t('Confirm you want to delete this workflow?')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleDeleteDialogSubmit}
            color="error"
            autoFocus
            startIcon={<Icon icon="mdi:delete-forever" />}
          >
            {t('Delete')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleDeleteDialogClose}
            color="secondary"
            startIcon={<Icon icon="mdi:close" />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const DisableDialog = () => {
    const isWorkflowActive = currentWorkflow?.is_active && !currentWorkflow?.is_paused

    return (
      <Dialog
        open={disableDialog}
        onClose={handleDisableDialogClose}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('Confirm Action')}
            </Typography>
            <IconButton
              size='small'
              onClick={handleDisableDialogClose}
              aria-label="close"
            >
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
                <Typography variant='h6'>
                  {isWorkflowActive
                    ? t('Confirm you want to disable this workflow.')
                    : t('Confirm you want to enable this workflow.')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleDisableDialogSubmit}
            color="primary"
            autoFocus
            startIcon={<Icon icon={isWorkflowActive ? "mdi:pause-circle" : "mdi:play-circle"} />}
          >
            {isWorkflowActive ? t('Disable') : t('Enable')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleDisableDialogClose}
            color="secondary"
            startIcon={<Icon icon="mdi:close" />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const ScheduleDialog = () => {
    return (
      <Dialog
        open={scheduleDialog}
        onClose={handleScheduleDialogClose}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('Schedule Workflow')}
            </Typography>
            <IconButton
              size='small'
              onClick={handleScheduleDialogClose}
              aria-label="close"
            >
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
                <Typography variant='h6'>
                  {t('Confirm you want to schedule this workflow.')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleScheduleDialogSubmit}
            color="primary"
            autoFocus
            startIcon={<Icon icon="mdi:calendar-clock" />}
          >
            {t('Schedule')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleScheduleDialogClose}
            color="secondary"
            startIcon={<Icon icon="mdi:close" />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const RunDialog = () => {
    return (
      <Dialog
        open={runDialog}
        onClose={handleRunDialogClose}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('Run Workflow')}
            </Typography>
            <IconButton
              size='small'
              onClick={handleRunDialogClose}
              aria-label="close"
            >
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
                <Typography variant='h6'>
                  {t('Confirm you want to run this workflow.')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleRunDialogSubmit}
            color="primary"
            autoFocus
            startIcon={<Icon icon="mdi:play" />}
          >
            {t('Run')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleRunDialogClose}
            color="secondary"
            startIcon={<Icon icon="mdi:close" />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/workflows', {
        params: {
          sort: memoizedSortModel[0]?.sort || 'asc',
          order_by: memoizedSortModel[0]?.field || 'dag_id',
          page: paginationModel.page,
          limit: paginationModel.pageSize,
          filter: JSON.stringify(filterModel),
        },
        timeout: 10000,
      })

      if (response.status === 200 && response.data) {
        setAllRows(response.data.dags || [])
        setRowCount(response.data.total_entries || 0)
        props.set_total(response.data.total_entries || 0)
      } else {
        throw new Error('Failed to fetch workflows')
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error)
      toast.error('Failed to fetch workflows')
      setAllRows([])
      setRowCount(0)
      props.set_total(0)
    } finally {
      setLoading(false)
    }
  }, [paginationModel.page, paginationModel.pageSize, memoizedSortModel, filterModel, props])

  const applyFiltersAndSort = useCallback(() => {
    let result = [...allRows]

    // Apply filtering
    if (filterModel.items.length > 0) {
      result = result.filter(row => {
        return filterModel.items.every(filter => {
          const value = row[filter.field]
          if (value === undefined || value === null) {
            return false
          }
          switch (filter.operator) {
            case 'contains':
              return value.toString().toLowerCase().includes(filter.value.toLowerCase())
            case 'equals':
              return value.toString().toLowerCase() === filter.value.toLowerCase()
            case 'startsWith':
              return value.toString().toLowerCase().startsWith(filter.value.toLowerCase())
            case 'endsWith':
              return value.toString().toLowerCase().endsWith(filter.value.toLowerCase())
            default:
              return true
          }
        })
      })
    }

    // Apply search
    if (searchValue) {
      const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
      result = result.filter(row => {
        return ['dag_id', 'schedule_interval', 'timetable_description'].some(field =>
          searchRegex.test(row[field]?.toString() || '')
        ) || (Array.isArray(row.owners) && row.owners.some(owner => searchRegex.test(owner)))
      })
    }

    // Apply sorting
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0]
      result.sort((a, b) => {
        if (a[field] < b[field]) return sort === 'asc' ? -1 : 1
        if (a[field] > b[field]) return sort === 'asc' ? 1 : -1
        return 0
      })
    }

    setRows(result)
  }, [allRows, filterModel, searchValue, sortModel])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    applyFiltersAndSort()
  }, [applyFiltersAndSort])

  const handleSearch = useCallback((value) => {
    setSearchValue(value)
  }, [])

  const handleScheduleDialogSubmit = async () => {
    const taskId = currentWorkflow?.dag_id

    if (!taskId) {
      console.error('Task ID is undefined')
      toast.error('Task ID is undefined or invalid')

      return
    }

    const apiToken = session?.data?.user?.apiToken // Assume apiToken is retrieved from the session

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
    }

    // Determine the correct endpoint URL based on the task's current status
    const endpoint = `/api/tasks/schedule/${taskId}`

    try {
      const response = await axios.post(
        endpoint,
        {}, // No body is required for these requests
        {
          headers
        }
      )

      if (response.status === 200) {
        // Show success message
        toast.success(`Workflow Successfully Scheduled`)
      } else {
        // Handle unsuccessful update
        toast.error(`Failed to Schedule Workflow`)
      }
    } catch (error) {
      console.error(`Failed to Schedule Workflow`, error)
      toast.error(`Failed to Schedule Workflow`)
    }

    // Close the dialog
    setScheduleDialog(false)
  }

  const handleRunDialogSubmit = async () => {
    const workflow_id = currentWorkflow?.dag_id

    if (!workflow_id) {
      console.error('Workflow ID is undefined')
      toast.error('Workflow ID is undefined or invalid')

      return
    }

    const apiToken = session?.data?.user?.apiToken // Assume apiToken is retrieved from the session

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
    }

    // Determine the correct endpoint URL based on the task's current status
    const endpoint = `/api/workflows/run/${workflow_id}`

    try {
      const response = await axios.post(
        endpoint,
        {
          note: "Manually triggered execution",
          // You can include any additional data here if needed
          conf: {},
        },
        {
          headers
        }
      )

      if (response.status === 200) {
        // Show success message
        toast.success(`Workflow Successfully Run`)
      } else {
        // Handle unsuccessful update
        toast.error(`Failed to Run Workflow`)
      }
    } catch (error) {
      console.error(`Failed to Run Workflow`, error)
      toast.error(`Failed to Run Workflow`)
    }

    // Close the dialog
    setRunDialog(false)
  }

  const handleDisableDialogSubmit = async () => {
    const isCurrentlyEnabled = currentWorkflow?.is_active && !currentWorkflow?.is_paused
    const workflowId = currentWorkflow?.dag_id

    if (!workflowId) {
      console.error('Workflow ID is undefined')
      toast.error('Workflow ID is undefined or invalid')

      return
    }

    const apiToken = session?.data?.user?.apiToken // Assume apiToken is retrieved from the session

    // Determine the correct endpoint URL based on the task's current status
    const endpoint = isCurrentlyEnabled ? `/api/workflows/disable/${workflowId}` : `/api/workflows/enable/${workflowId}`

    try {
      const response = await axios.post(
        endpoint,
        {}, // No body is required for these requests
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      )

      if (response.status === 200) {
        // Assuming 200 is your success status code
        // Update UI to reflect the task's new status
        const newStatus = isCurrentlyEnabled ? 'disabled' : 'enabled'
        const updatedRows = rows.map(row => (row.dag_id === workflowId ? { ...row, status: newStatus } : row))
        setRows(updatedRows)

        setRefetchTrigger(Date.now())

        // Show success message
        toast.success(`Workflow ${newStatus === 'enabled' ? 'Enabled' : 'Disabled'}`)
      } else {
        // Handle unsuccessful update
        toast.error(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Workflow`)
      }
    } catch (error) {
      console.error(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Workflow`, error)
      toast.error(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Workflow`)
    }

    // Close the dialog
    setDisableDialog(false)
  }

  const handleDeleteDialogSubmit = async () => {
    try {
      const apiToken = session?.data?.user?.apiToken

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
      }

      // console.log('Deleting Task:', currentWorkflow)

      const endpoint = `/api/workflows/${currentWorkflow.dag_id}`

      console.log('DELETE Endpoint:', endpoint)
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentWorkflow.dag_id)

        setRows(updatedRows)
        setDeleteDialog(false)

        // props.set_total(props.total - 1)

        setRefetchTrigger(Date.now())

        toast.success('Successfully deleted Task')
      }
    } catch (error) {
      console.error('Failed to delete Task', error)
      toast.error('Failed to delete Task')
    }
  }

  // Use an effect to synchronize the DataGrid's selection model with tasksIds
  useEffect(() => {
    // This updates the DataGrid's selection model whenever tasksIds changes
    setRowSelectionModel(workflowIds)
  }, [workflowIds])

  return (
    <Box>
      <Card sx={{ position: 'relative' }}>
        <CardHeader title={t(props.type)} sx={{ textTransform: 'capitalize' }} />
        <CustomDataGrid
          getRowId={(row) => row.dag_id}
          localeText={{
            toolbarColumns: t('Columns'),
            toolbarFilters: t('Filters')
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                created_at: false,
                modified_at: false,
                id: false,
                organization: false
              }
            }
          }}
          autoHeight={true}
          rows={rows}
          apiRef={dgApiRef}
          rowCount={rowCount}
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
          getDetailPanelHeight={getDetailPanelHeight}
          getDetailPanelContent={getDetailPanelContent}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          onDetailPanelExpandedRowIdsChange={handleDetailPanelExpandedRowIdsChange}
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
              message: t('No Workflows found')
            },
            noResultsOverlay: {
              message: t('No Results Found')
            },
            toolbar: {
              value: searchValue,
              clearSearch: () => handleSearch(''),
              onChange: event => handleSearch(event.target.value),
              setColumnsButtonEl,
              setFilterButtonEl,
              setFilterActive,
              showButtons: false,
              showexport: true,
              showRefresh: true,
              setRunRefresh,
              setRunFilterQuery: () => {
                applyFiltersAndSort();
              }
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
        <RunDialog />
        <DisableDialog />
        <EditDialog />
        <DeleteDialog />
      </Card>
    </Box>
  )
}

export default WorkflowsList
