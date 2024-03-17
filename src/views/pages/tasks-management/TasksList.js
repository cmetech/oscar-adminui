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
import { DataGridPro, useGridApiRef } from '@mui/x-data-grid-pro'
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
import { parseISO, format } from 'date-fns'
import formatDistance from 'date-fns/formatDistance'
import { useTranslation } from 'react-i18next'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { CustomDataGrid, TabList } from 'src/lib/styled-components.js'
import UpdateServerWizard from 'src/views/pages/inventory/forms/UpdateServerWizard'
import RunTaskWizard from 'src/views/pages/tasks-management/forms/RunTaskWizard'
import TaskDetailPanel from 'src/views/pages/tasks-management/TaskDetailPanel'
import { taskIdsAtom, tasksAtom, refetchTaskTriggerAtom } from 'src/lib/atoms'

function loadServerRows(page, pageSize, data) {
  // console.log(data)

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

const TasksList = props => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const dgApiRef = useGridApiRef()
  const session = useSession()
  const { t } = useTranslation()
  const theme = useTheme()

  // ** Data Grid state
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [rowSelectionModel, setRowSelectionModel] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [rowCountState, setRowCountState] = useState(rowCount)
  const [sort, setSort] = useState('asc')

  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [pinnedColumns, setPinnedColumns] = useState({})
  const [isFilterActive, setFilterActive] = useState(false)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])
  const [tasksIds, setTaskIds] = useAtom(taskIdsAtom)
  const [tasks, setTasks] = useAtom(tasksAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchTaskTriggerAtom)

  // ** Dialog
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [disableDialog, setDisableDialog] = useState(false)
  const [scheduleDialog, setScheduleDialog] = useState(false)
  const [runDialog, setRunDialog] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)

  const editmode = false

  const getDetailPanelContent = useCallback(({ row }) => <TaskDetailPanel row={row} />, [])
  const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  // column definitions
  const columns = [
    {
      flex: 0.03,
      field: 'name',
      editable: editmode,
      headerName: t('Name'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledLink href='#'>{row?.name?.toUpperCase()}</StyledLink>
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
                {row?.id}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      field: 'owner',
      editable: editmode,
      headerName: t('Owner'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledLink href='#'>{row?.owner?.toUpperCase()}</StyledLink>
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
                {row?.organization?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'status',
      editable: editmode,
      headerName: t('Status'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'error'
        let label = 'UNKN'
        if (row?.status?.toLowerCase() === 'enabled') {
          color = 'success'
          label = 'ACTIVE'
        } else {
          color = 'error'
          label = 'INACTIVE'
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CustomChip
                rounded
                size='medium'
                skin='light'
                label={label || 'UNKN'}
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
      flex: 0.015,
      field: 'type',
      editable: editmode,
      headerName: t('Type'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = theme.palette.mode === 'light' ? 'primary' : 'secondary'
        let label = 'UNKN'
        let iconimage = 'mdi:account-question-outline'
        if (row?.type?.toLowerCase() === 'invoke') {
          label = 'AUTOMATION'
          iconimage = 'mdi:script-text'
        } else if (row?.type?.toLowerCase() === 'fabric') {
          label = 'AUTOMATION'
          iconimage = 'mdi:script-text'
        } else if (row?.type?.toLowerCase() === 'ansible') {
          label = 'RUNBOOK'
          iconimage = 'mdi:arrow-decision-auto'
        } else if (row?.type?.toLowerCase() === 'script') {
          label = row?.type?.toUpperCase()
          iconimage = 'mdi:script-text'
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CustomChip
                rounded
                size='medium'
                skin='light'
                label={label || 'UNKN'}
                color={color}
                icon={<Icon icon={iconimage} />}
                sx={{
                  '& .MuiChip-label': { textTransform: 'capitalize' },
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandBlack
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
      editable: editmode,
      headerName: t('Description'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
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
      field: 'createdAtTime',
      editable: editmode,
      headerName: t('Created At'),
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
      flex: 0.02,
      minWidth: 60,
      field: 'updatedAtTime',
      editable: editmode,
      headerName: t('Updated At'),
      renderCell: params => {
        const { row } = params

        const updatedAtDate = parseISO(row.modified_at.substring(0, 19))
        const humanReadableDate = format(updatedAtDate, 'PPpp')

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
      field: 'actions',
      headerName: t('Actions'),
      type: 'string',
      flex: 0.02,
      minWidth: 10,
      renderCell: params => {
        const { row } = params

        return (
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
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
          </Stack>
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
              Edit Task Information
            </Typography>
            <Typography variant='body2'>Updates to task information will be effective immediately.</Typography>
          </Box>
          {currentTask && (
            <UpdateServerWizard
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
                  Please confirm that you want to delete this task.
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
                  Please confirm that you want to schedule this task.
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
                      Please confirm that you want to run this task.
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
        toast.success(`Task Successfully Scheduled`)
      } else {
        // Handle unsuccessful update
        toast.error(`Failed to Schedule Task`)
      }
    } catch (error) {
      console.error(`Failed to Schedule Task`, error)
      toast.error(`Failed to Schedule Task`)
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
        {}, // No body is required for these requests
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
    setRowSelectionModel(tasksIds)
  }, [tasksIds])

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async (sort, q, column) => {
      let data = []

      setLoading(true)
      await axios
        .get('/api/tasks', {
          params: {
            q,
            sort,
            column
          }
        })
        .then(res => {
          setRowCount(res.data.total)
          data = res.data.rows
          props.set_total(res.data.total)
          setTasks(data)
        })

      await loadServerRows(paginationModel.page, paginationModel.pageSize, data).then(slicedRows => setRows(slicedRows))
      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel.page, paginationModel.pageSize, setTasks]
  )

  useEffect(() => {
    fetchData(sort, searchValue, sortColumn)
  }, [refetchTrigger, fetchData, searchValue, sort, sortColumn])

  const handleSortModel = newModel => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
      fetchData(newModel[0].sort, searchValue, newModel[0].field)
    } else {
      setSort('asc')
      setSortColumn('name')
    }
  }

  const handleAction = event => {
    setAction(event.target.value)
  }

  const handleSearch = value => {
    setSearchValue(value)
    fetchData(sort, value, sortColumn)
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
    setTaskIds(newRowSelectionModel)
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
                createdAtTime: true
              }
            }
          }}
          autoHeight={true}
          pagination
          rows={rows}
          apiRef={dgApiRef}
          rowCount={rowCountState}
          columns={columns}
          checkboxSelection={true}
          disableRowSelectionOnClick
          sortingMode='server'
          paginationMode='server'
          paginationModel={paginationModel}
          onSortModelChange={handleSortModel}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={newPage => setPage(newPage)}
          onPaginationModelChange={setPaginationModel}
          components={{ Toolbar: ServerSideToolbar }}
          onRowSelectionModelChange={newRowSelectionModel => handleRowSelection(newRowSelectionModel)}
          rowSelectionModel={rowSelectionModel}
          getDetailPanelHeight={getDetailPanelHeight}
          getDetailPanelContent={getDetailPanelContent}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          onDetailPanelExpandedRowIdsChange={handleDetailPanelExpandedRowIdsChange}
          loading={loading}
          keepNonExistentRowsSelected
          componentsProps={{
            baseButton: {
              variant: 'outlined'
            },
            panel: {
              anchorEl: isFilterActive ? filterButtonEl : columnsButtonEl
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

export default TasksList
