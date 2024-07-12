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
import TaskDetailPanel from 'src/views/pages/tasks-management/TaskDetailPanel'
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
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [rowSelectionModel, setRowSelectionModel] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [rowCountState, setRowCountState] = useState(rowCount)
  const [sortModel, setSortModel] = useState([{ field: 'dag_id', sort: 'asc' }])

  // ** State
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
  const [currentTask, setCurrentTask] = useState(null)

  const memoizedSortModel = useMemo(() => sortModel, [sortModel]);

  const getDetailPanelContent = useCallback(({ row }) => <TaskDetailPanel row={row} />, [])
  const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  // column definitions
  const columns = [
    {
      flex: 0.03,
      field: 'dag_id',
      headerName: 'Name',
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
              <Typography title={row?.dag_id?.toUpperCase()} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {row?.dag_id?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      field: 'owners',
      headerName: 'Owner',
      renderCell: params => {
        const { row } = params
        const owner = row?.owners?.length ? row.owners[0] : 'Unknown'
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
              <Typography title={owner.toUpperCase()} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {owner.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'status',
      headerName: 'Status',
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params
        const isPaused = row?.is_paused
        const isActive = row?.is_active
        let color = 'error'
        let label = 'DISABLED'
        if (isActive && !isPaused) {
          color = 'success'
          label = 'ENABLED'
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
                textOverflow: 'ellipsis'
              }}
            >
              <CustomChip
                title={label}
                overflow='hidden'
                textOverflow='ellipsis'
                rounded
                size='medium'
                skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                label={label}
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
      flex: 0.03,
      minWidth: 100,
      field: 'schedule_interval',
      headerName: 'Schedule Interval',
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
              <Typography title={row?.schedule_interval?.value} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
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
      headerName: 'Timetable Description',
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
              <Typography title={row?.timetable_description} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {row?.timetable_description}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 60,
      field: 'next_dagrun',
      headerName: 'Next Run',
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
              <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography title={humanReadableDate} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
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
                title='Schedule Task'
                aria-label='Schedule Task'
                color='info'
                onClick={() => {
                  setCurrentTask(row)
                  setScheduleDialog(true)
                }}
              >
                <Icon icon='mdi:clock-outline' />
              </IconButton>
              <IconButton
                size='small'
                title='Run Task'
                aria-label='Run Task'
                color='warning'
                onClick={() => {
                  setCurrentTask(row)
                  setRunDialog(true)
                }}
              >
                <Icon icon='mdi:play-circle-outline' />
              </IconButton>
              <IconButton
                size='small'
                title={row?.status?.toLowerCase() === 'enabled' ? 'Disable Task' : 'Enable Task'}
                aria-label={row?.status?.toLowerCase() === 'enabled' ? 'Disable Task' : 'Enable Task'}
                color={row?.status?.toLowerCase() === 'enabled' ? 'success' : 'secondary'}
                onClick={() => {
                  setCurrentTask(row)
                  setDisableDialog(true)
                }}
              >
                <Icon icon={row?.status?.toLowerCase() === 'enabled' ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} />
              </IconButton>
              <IconButton
                size='small'
                title='Edit Task'
                color='secondary'
                aria-label='Edit Task'
                onClick={() => {
                  setCurrentTask(row)
                  setEditDialog(true)
                }}
              >
                <Icon icon='mdi:account-edit' />
              </IconButton>
              <IconButton
                size='small'
                title='Delete Task'
                aria-label='Delete Task'
                color='error'
                onClick={() => {
                  setCurrentTask(row)
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
              {currentTask?.name?.toUpperCase() ?? ''}
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
              {currentTask?.id ?? ''}
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
              Edit Workflow Information
            </Typography>
            <Typography variant='body2'>Updates to workflow information will be effective immediately.</Typography>
          </Box>
          {currentTask && (
            <UpdateTaskWizard
              currentTask={currentTask}
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
              {currentTask?.name?.toUpperCase() ?? ''}
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
              {currentTask?.id ?? ''}
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
                  Please confirm that you want to delete this workflow.
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
    // Determine if the task is currently enabled
    const isTaskEnabled = currentTask?.status?.toLowerCase() === 'enabled'

    // Determine the dialog title text based on the task status
    const dialogTitleText = isTaskEnabled ? 'Please confirm disable of ' : 'Please confirm enable of '

    // Determine the action button text based on the task status
    const actionButtonText = isTaskEnabled ? 'Disable' : 'Enable'

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
              {currentTask?.name?.toUpperCase() ?? ''}
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
              {currentTask?.id ?? ''}
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
                  {currentTask?.name}
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

  const ScheduleDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={scheduleDialog}
        onClose={handleScheduleDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentTask?.name?.toUpperCase() ?? ''}
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
              {currentTask?.id ?? ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
            size='small'
            onClick={() => handleScheduleDialogClose()}
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
                  Please confirm that you want to schedule this workflow.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' sx={{ mr: 1 }} onClick={handleScheduleDialogSubmit} color='primary'>
            Schedule
          </Button>
          <Button variant='outlined' onClick={handleScheduleDialogClose} color='secondary'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const RunDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={runDialog}
        onClose={handleRunDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentTask?.name?.toUpperCase() ?? ''}
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
              {currentTask?.id ?? ''}
            </Typography>
          </Box>
        </DialogTitle>
        {currentTask?.prompts?.length ? (
          <DialogContent>
            <IconButton
              size='small'
              onClick={() => handleRunDialogClose()}
              sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
            >
              <Icon icon='mdi:close' />
            </IconButton>
            <RunTaskWizard currentTask={currentTask} rows={rows} setRows={setRows} onClose={handleRunDialogClose} />
          </DialogContent>
        ) : (
          <>
            <DialogContent>
              <IconButton
                size='small'
                onClick={() => handleRunDialogClose()}
                sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
              >
                <Icon icon='mdi:close' />
              </IconButton>
              <Box sx={{ mb: 8, textAlign: 'center' }}>
                <Stack direction='row' spacing={2} justifyContent='center' alignContent='center'>
                  <Box>
                    <Typography variant='h5' justifyContent='center' alignContent='center'>
                      Please confirm that you want to run this workflow.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button variant='contained' sx={{ mr: 1 }} onClick={handleRunDialogSubmit} color='primary'>
                Run
              </Button>
              <Button variant='outlined' onClick={handleRunDialogClose} color='secondary'>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    )
  }

  const handleScheduleDialogSubmit = async () => {
    const taskId = currentTask?.id

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
    const taskId = currentTask?.id

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
    const endpoint = `/api/tasks/run/${taskId}`

    try {
      const response = await axios.post(
        endpoint,
        [], // No body is required for these requests
        {
          headers
        }
      )

      if (response.status === 200) {
        // Show success message
        toast.success(`Task Successfully Run`)
      } else {
        // Handle unsuccessful update
        toast.error(`Failed to Run Task`)
      }
    } catch (error) {
      console.error(`Failed to Run Task`, error)
      toast.error(`Failed to Run Task`)
    }

    // Close the dialog
    setRunDialog(false)
  }

  const handleDisableDialogSubmit = async () => {
    const isCurrentlyEnabled = currentTask?.status === 'enabled'
    const taskId = currentTask?.id

    if (!taskId) {
      console.error('Task ID is undefined')
      toast.error('Task ID is undefined or invalid')

      return
    }

    const apiToken = session?.data?.user?.apiToken // Assume apiToken is retrieved from the session

    // Determine the correct endpoint URL based on the task's current status
    const endpoint = isCurrentlyEnabled ? `/api/tasks/disable/${taskId}` : `/api/tasks/enable/${taskId}`

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
        const updatedRows = rows.map(row => (row.id === taskId ? { ...row, status: newStatus } : row))
        setRows(updatedRows)

        // Show success message
        toast.success(`Task ${newStatus === 'enabled' ? 'Enabled' : 'Disabled'}`)
      } else {
        // Handle unsuccessful update
        toast.error(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Task`)
      }
    } catch (error) {
      console.error(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Task`, error)
      toast.error(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Task`)
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

      // console.log('Deleting Task:', currentTask)

      const endpoint = `/api/tasks/delete/${currentTask.id}`

      console.log('DELETE Endpoint:', endpoint)
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentTask.id)

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

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(async (filter_model = {}) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/workflows', {
        params: {
          sort: memoizedSortModel[0]?.sort || 'asc',
          order_by: memoizedSortModel[0]?.field || 'dag_id',
          offset: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          filter: JSON.stringify(filter_model),
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        setRows(response.data.dags);
        setRowCount(response.data.total_entries);
        props.set_total(response.data.total_entries);
      } else {
        setRows([]);
        setRowCount(0);
        props.set_total(0);
        toast.error('Failed to fetch workflows');
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      setRows([]);
      setRowCount(0);
      props.set_total(0);
      toast.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
      setRunFilterQuery(false);
      setRunRefresh(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel]);

  // Effect to fetch data initially and start the periodic refresh
  useEffect(() => {
    if (!runFilterQuery) {
      fetchData()
    }

    const intervalId = setInterval(fetchData, 300000) // Fetch data every 300 seconds (5 minutes)

    return () => clearInterval(intervalId) // Cleanup interval on component unmount
  }, [fetchData, refetchTrigger, runFilterQuery])

  // Trigger based on filter application
  useEffect(() => {
    console.log('Effect Run:', { itemsLength: filterModel.items.length, runFilterQuery })
    console.log('Filter Model:', JSON.stringify(filterModel))

    if (runFilterQuery && filterModel.items.length > 0) {
      if (filterMode === 'server') {
        const sort = sortModel[0]?.sort
        const sortColumn = sortModel[0]?.field
        fetchData(filterModel)
      } else {
        // client side filtering
      }
      setRunFilterQueryCount(prevRunFilterQueryCount => (prevRunFilterQueryCount += 1))
    } else if (runFilterQuery && filterModel.items.length === 0 && runFilterQueryCount > 0) {
      if (filterMode === 'server') {
        fetchData(filterModel)
      } else {
        // client side filtering
      }
      setRunFilterQueryCount(0)
    } else {
      console.log('Conditions not met', { itemsLength: filterModel.items.length, runFilterQuery })
    }

    // Reset the runFilterQuery flag
    return () => {
      runFilterQuery && setRunFilterQuery(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModel, runFilterQuery]) // Triggered by filter changes

  useEffect(() => {
    fetchData()
  }, [fetchData, refetchTrigger])

  useEffect(() => {
    const registerAndFetchData = async () => {
      if (runRefresh && !hasRunRef.current) {
        hasRunRef.current = true
        try {
          await axios.post('/api/tasks/register', { timeout: 10000 })
        } catch (error) {
          console.error('Error refreshing workflows:', error)
          toast.error('Failed to refresh workflows')
        } finally {
          fetchData()
          setRunRefresh(false)
        }
      }
    }

    registerAndFetchData()

    // Reset the flag in the cleanup function
    return () => {
      hasRunRef.current = false
    }
  }, [fetchData, runRefresh, setRunRefresh])

  // Trigger based on sort
  useEffect(() => {
    console.log('Effect Run:', { sortModel, runFilterQuery })
    console.log('Sort Model:', JSON.stringify(sortModel))

    if (sortingMode === 'server') {
      console.log('Sort Model:', JSON.stringify(sortModel))
      // fetchData()
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

    // Reset sortModel on unmount
    return () => {
      setSortModel([{ field: 'dag_id', sort: 'asc' }])
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedSortModel])

  const handleAction = event => {
    setAction(event.target.value)
  }

  const handleSearch = value => {
    // console.log('Search Value:', value)

    setSearchValue(value)
    const searchRegex = new RegExp(escapeRegExp(value), 'i')

    const filteredRows = rows.filter(row => {
      console.log('Row:', row)

      // Extend the search to include nested paths
      // Extend the search to include nested paths
      const searchFields = [
        'id',
        'name',
        'celery_job_name',
        'type',
        'status',
        'owner',
        'organization',
        'description',
        'schedule.id',
        'schedule.task_id',
        'schedule.minute',
        'schedule.hour',
        'schedule.day',
        'schedule.month',
        'schedule.year',
        'args', // Array of arguments
        'kwargs.key1',
        'kwargs.key2',
        'kwargs.key3',
        'metadata.metakey1',
        'metadata.metakey2',
        'metadata.metakey3',
        'hosts' // Array of hosts
      ]

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

  const handleRegisterTasks = async () => {
    console.log('Registering Tasks')
    try {
      const response = await axios.post('/api/tasks/register', {})

      // Handle success response
      console.log('Tasks successfully registered:', response.data)

      // Optionally, use a UI notification library to inform the user
      // For example, if you're using react-hot-toast
      toast.success('Tasks successfully registered')
    } catch (error) {
      console.error('Error registering tasks:', error)

      // Handle error response
      // Optionally, use a UI notification library to inform the user about the error
      toast.error('Failed to register tasks')
    }
  }

  const handleRowSelection = newRowSelectionModel => {
    const addedIds = newRowSelectionModel.filter(id => !rowSelectionModel.includes(id))

    console.log('Added IDs:', addedIds)

    addedIds.forEach(id => {
      const row = rows.find(r => r.id === id)
      console.log('Added Row:', row)
    })

    // Update the row selection model
    setRowSelectionModel(newRowSelectionModel)

    // Update the Jotai atom with the new selection model
    setWorkflowIds(newRowSelectionModel)
  }

  // Hidden columns
  const hiddenFields = ['id', 'organization']

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  return (
    <Box>
      <Card sx={{ position: 'relative' }}>
        <CardHeader title={t(props.type)} sx={{ textTransform: 'capitalize' }} />
        <CustomDataGrid
          getRowId={(row) => row.dag_display_name}
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
              message: 'No Tasks found'
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
        <ScheduleDialog />
        <RunDialog />
        <DisableDialog />
        <EditDialog />
        <DeleteDialog />
      </Card>
    </Box>
  )
}

export default WorkflowsList
