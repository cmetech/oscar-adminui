// ** React Imports
import { useState, useContext, useEffect, useCallback, useRef, forwardRef } from 'react'
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
import { taskIdsAtom, tasksAtom, refetchTaskTriggerAtom } from 'src/lib/atoms'
import UpdateTaskWizard from 'src/views/pages/tasks-management/forms/UpdateTaskWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import { on } from 'form-data'
import { fi } from 'date-fns/locale'

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

// TODO: Test with no Tasks to see if the NoRowsOverlay is displayed with the Register Tasks button
// FIXME: Deleting all tasks works, but I am reloading the tasks automatically, I should now use the Overlay Register Tasks button

const TasksList = props => {
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
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }])

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
  const [tasksIds, setTaskIds] = useAtom(taskIdsAtom)
  const [tasks, setTasks] = useAtom(tasksAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchTaskTriggerAtom)
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

  const getDetailPanelContent = useCallback(({ row }) => <TaskDetailPanel row={row} />, [])
  const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  // column definitions
  const columns = [
    {
      flex: 0.02,
      field: 'id',
      headerName: t('Identifier')
    },
    {
      flex: 0.02,
      field: 'organization',
      headerName: t('Organization')
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
              alignItems: 'center', // Ensures vertical centering inside the Box
              justifyContent: 'flex-start',
              width: '100%', // Ensures the Box takes full width of the cell
              height: '100%' // Ensures the Box takes full height of the cell
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography title={row?.name?.toUpperCase()} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {row?.name?.toUpperCase()}
              </Typography>
              <Typography
                title={row?.id}
                noWrap
                overflow={'hidden'}
                textOverflow={'ellipsis'}
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
      flex: 0.02,
      field: 'owner',
      headerName: t('Owner'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography title={row?.name?.toUpperCase()} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {row?.owner?.toUpperCase()}
              </Typography>
              <Typography
                title={row?.organization?.toUpperCase()}
                noWrap
                overflow={'hidden'}
                textOverflow={'ellipsis'}
                variant='caption'
                sx={{
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandBlue
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
      headerName: t('Status'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'error'
        let label = 'UNKN'
        if (row?.status?.toLowerCase() === 'enabled') {
          color = 'success'
          label = 'ENABLED'
        } else {
          color = 'error'
          label = 'DISABLED'
        }

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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center', // Ensures vertical centering inside the Box
                flexDirection: 'column',
                justifyContent: 'center', // Ensures content within this Box is also centered vertically
                width: '100%', // Uses full width to align text to the start properly
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
      headerName: t('Type'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = theme.palette.mode === 'light' ? 'secondary' : 'secondary'
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center', // Ensures vertical centering inside the Box
              justifyContent: 'flex-start',
              width: '100%', // Ensures the Box takes full width of the cell
              height: '100%' // Ensures the Box takes full height of the cell
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center', // Ensures vertical centering inside the Box
                flexDirection: 'column',
                justifyContent: 'center', // Ensures content within this Box is also centered vertically
                width: '100%', // Uses full width to align text to the start properly
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
              alignItems: 'center', // Ensures vertical centering inside the Box
              justifyContent: 'flex-start',
              width: '100%', // Ensures the Box takes full width of the cell
              height: '100%' // Ensures the Box takes full height of the cell
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography title={row?.description} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
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
      field: 'next_run_time',
      headerName: t('Next Run'),
      renderCell: params => {
        const { row } = params

        const timezone = session?.data?.user?.timezone || 'US/Eastern'

        // Check if next_run_time exists and is a valid date
        if (row?.next_run_time && !isNaN(new Date(row.next_run_time).getTime())) {
          const humanReadableDate = formatInTimeZone(
            utcToZonedTime(parseISO(row.next_run_time), timezone),
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
          // If next_run_time is null or not a valid date, display an empty cell
          return null
        }
      }
    },
    {
      flex: 0.02,
      minWidth: 60,
      field: 'created_at',
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
              alignItems: 'center', // Ensures vertical centering inside the Box
              justifyContent: 'flex-start',
              width: '100%', // Ensures the Box takes full width of the cell
              height: '100%' // Ensures the Box takes full height of the cell
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography title={humanReadableDate} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
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
      field: 'modified_at',
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
              alignItems: 'center', // Ensures vertical centering inside the Box
              justifyContent: 'flex-start',
              width: '100%', // Ensures the Box takes full width of the cell
              height: '100%' // Ensures the Box takes full height of the cell
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography title={humanReadableDate} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
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
        const isActive = row?.status.toLowerCase() === 'enabled'

        return (
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
              disabled={!isActive || !ability.can('schedule', 'tasks')}
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
              disabled={!isActive || !ability.can('run', 'tasks')}
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
              disabled={!ability.can('update', 'tasks')}
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
              disabled={!ability.can('update', 'tasks')}
            >
              <Icon icon='mdi:edit' />
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
              disabled={!ability.can('delete', 'tasks')}
            >
              <Icon icon='mdi:delete-forever' />
            </IconButton>
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
              Edit Task Information
            </Typography>
            <Typography variant='body2'>Updates to task information will be effective immediately.</Typography>
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
                  {t('Confirm you want to delete this task?')}
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
    const isTaskActive = currentTask?.status?.toLowerCase() === 'enabled'

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
                  {isTaskActive
                    ? t('Confirm you want to disable this task.')
                    : t('Confirm you want to enable this task.')}
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
            startIcon={<Icon icon={isTaskActive ? "mdi:pause-circle" : "mdi:play-circle"} />}
          >
            {isTaskActive ? t('Disable') : t('Enable')}
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
              {t('Run Task')}
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
        {currentTask?.prompts?.length ? (
          <DialogContent>
            <RunTaskWizard currentTask={currentTask} rows={rows} setRows={setRows} onClose={handleRunDialogClose} />
          </DialogContent>
          ) : (
            <>
            <DialogContent>
              <Box sx={{ textAlign: 'center' }}>
                <Stack direction='row' spacing={2} justifyContent='center' alignItems='center'>
                  <Box>
                    <Typography variant='h6'>
                      {t('Confirm you want to run this task.')}
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
          </>
        )}
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
              {t('Schedule Task')}
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
                  {t('Confirm you want to schedule this task.')}
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

  const handleScheduleDialogSubmit = async () => {
    const taskId = currentTask?.id

    if (!taskId) {
      console.error('Task ID is undefined')
      toast.error(t('Task ID is undefined or invalid'))

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
        toast.success(t('Task Successfully Scheduled'))
      } else {
        // Handle unsuccessful update
        toast.error(t('Failed to Schedule Task'))
      }
    } catch (error) {
      console.error(t('Failed to Schedule Task'), error)
      toast.error(t('Failed to Schedule Task'))
    }

    // Close the dialog
    setScheduleDialog(false)
  }

  const handleRunDialogSubmit = async () => {
    const taskId = currentTask?.id

    if (!taskId) {
      console.error('Task ID is undefined')
      toast.error(t('Task ID is undefined or invalid'))

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
        toast.success(t('Task Successfully Run'))
      } else {
        // Handle unsuccessful update
        toast.error(t('Failed to Run Task'))
      }
    } catch (error) {
      console.error(t('Failed to Run Task'), error)
      toast.error(t('Failed to Run Task'))
    }

    // Close the dialog
    setRunDialog(false)
  }

  const handleDisableDialogSubmit = async () => {
    const isCurrentlyEnabled = currentTask?.status === 'enabled'
    const taskId = currentTask?.id

    if (!taskId) {
      console.error('Task ID is undefined')
      toast.error(t('Task ID is undefined or invalid'))

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
        toast.success(t(`Task ${newStatus === 'enabled' ? 'Enabled' : 'Disabled'}`))
      } else {
        // Handle unsuccessful update
        toast.error(t(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Task`))
      }
    } catch (error) {
      console.error(t(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Task`), error)
      toast.error(t(`Failed to ${isCurrentlyEnabled ? 'Disable' : 'Enable'} Task`))
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

        toast.success(t('Successfully deleted Task'))
      }
    } catch (error) {
      console.error(t('Failed to delete Task'), error)
      toast.error(t('Failed to delete Task'))
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
    async filter_model => {
      // Flag to track whether the request has completed
      let requestCompleted = false

      setLoading(true)

      // Start a timeout to automatically stop loading after 60s
      const timeoutId = setTimeout(() => {
        if (!requestCompleted) {
          setLoading(false)

          // Optionally, set state to show a "no results found" message or take other actions
          console.log('Request timed out.')

          // Clear the rows or show some placeholder to indicate no results or timeout
          setRows([])
        }
      }, 20000) // 60s timeout

      try {
        const response = await axios.get('/api/tasks', {
          params: {
            sort: sortModel[0]?.sort || 'asc',
            column: sortModel[0]?.field || 'name',
            skip: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            filter: JSON.stringify(filter_model)
          },
          timeout: 10000
        })

        setRowCount(response.data.total_records)
        setRows(response.data.records)
        props.set_total(response.data.total_records)
        setTasks(response.data.records)
      } catch (error) {
        console.error(t('Failed to fetch tasks'), error)
        toast.error(t('Failed to fetch tasks'))
      } finally {
        // Mark the request as completed
        requestCompleted = true
        setLoading(false)

        // Clear the timeout
        clearTimeout(timeoutId)
        setRunFilterQuery(false)
        setRunRefresh(false)
      }

      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel.page, paginationModel.pageSize]
  )

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
          console.error(t('Error refreshing tasks'), error)
          toast.error(t('Failed to refresh tasks'))
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
      fetchData()
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
      setSortModel([{ field: 'name', sort: 'asc' }])
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel[0]?.field, sortModel[0]?.sort])

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
      toast.success(t('Tasks successfully registered'))
    } catch (error) {
      console.error(t('Error registering tasks'), error)

      // Handle error response
      // Optionally, use a UI notification library to inform the user about the error
      toast.error(t('Failed to register tasks'))
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
    setTaskIds(newRowSelectionModel)
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
              message: t('No Tasks found')
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

export default TasksList
