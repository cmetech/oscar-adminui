// ** React Imports
import { useState, useContext, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
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
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

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
import { probeIdsAtom, probesAtom, refetchProbeTriggerAtom, timezoneAtom } from 'src/lib/atoms'
import UpdateProbeWizard from 'src/views/pages/probes/forms/UpdateProbeWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import ProbeDetailPanel from 'src/views/pages/probes/ProbeDetailPanel'

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

// TODO: Test with no Probes to see if the NoRowsOverlay is displayed with the Register Probes button
// FIXME: Deleting all probes works, but I am reloading the probes automatically, I should now use the Overlay Register Probes button

const ActiveProbes = forwardRef((props, ref) => {
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
  const [runRefresh, setRunRefresh] = useState(false)
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])
  const [probeIds, setProbeIds] = useAtom(probeIdsAtom)
  const [probes, setProbes] = useAtom(probesAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchProbeTriggerAtom)
  const [filterMode, setFilterMode] = useState('client')
  const [sortingMode, setSortingMode] = useState('client')
  const [paginationMode, setPaginationMode] = useState('server')
  const [timezone] = useAtom(timezoneAtom)
  // ** Dialog
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [disableDialog, setDisableDialog] = useState(false)
  const [scheduleDialog, setScheduleDialog] = useState(false)
  const [runDialog, setRunDialog] = useState(false)
  const [currentProbe, setCurrentProbe] = useState(null)
  const [exportDialog, setExportDialog] = useState(false)

  const getDetailPanelContent = useCallback(({ row }) => <ProbeDetailPanel row={row} />, [])
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
      field: 'target',
      headerName: t('TARGET'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.target} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.target}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      field: 'status',
      headerName: t('Status'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'secondary'
        let label = t('UNKNOWN')
        let skin = theme.palette.mode === 'dark' ? 'light' : 'dark'
        if (row?.operational_status?.toLowerCase() === 'up' && row?.status?.toLowerCase() === 'enabled') {
          color = 'success'
          label = t('UP')
        } else if (row?.operational_status?.toLowerCase() === 'down' && row?.status?.toLowerCase() === 'enabled') {
          color = 'error'
          label = t('DOWN')
        } else if (row?.status?.toLowerCase() === 'disabled') {
          skin = 'dark'
          color = 'secondary'
          label = t('DISABLED')
        } else {
          skin = 'dark'
          color = 'secondary'
          label = t('UNKNOWN')
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
                label={label || t('UNKNOWN')}
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
      field: 'ssl_status',
      headerName: t('SSL'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params
        const shouldShowChip = row.target && !row.target.startsWith('http:') && row.type !== 'api'

        let color = 'secondary'
        let label = t('UNKNOWN')
        let skin = theme.palette.mode === 'dark' ? 'light' : 'dark'
        if (
          row?.operational_status?.toLowerCase() === 'up' &&
          row?.status?.toLowerCase() === 'enabled' &&
          row?.ssl_status?.toLowerCase() === 'ok'
        ) {
          color = 'success'
          label = t('OK')
        } else if (
          row?.operational_status?.toLowerCase() === 'down' &&
          row?.status?.toLowerCase() === 'enabled' &&
          row?.ssl_status?.toLowerCase() === 'invalid'
        ) {
          color = 'error'
          label = t('INVALID')
        } else if (row?.operational_status?.toLowerCase() === 'unknown') {
          skin = 'dark'
          color = 'secondary'
          label = t('UNKNOWN')
        } else {
          skin = 'dark'
          color = 'secondary'
          label = t('UNKNOWN')
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
            {shouldShowChip ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center', // Ensures vertical centering inside the Box
                  flexDirection: 'column',
                  justifyContent: 'center', // Ensures content within this Box is also centered vertically
                  width: '100%', // Uses full width to align text to the start properly
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
                  label={label || t('UNKN')}
                  color={color}
                  sx={{
                    '& .MuiChip-label': { textTransform: 'capitalize' },
                    width: '120px'
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ width: '120px', height: '100%' }} />
            )}
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'http_status_code',
      align: 'center',
      headerAlign: 'center',
      headerName: t('HTTP CODE'),
      renderCell: params => {
        const { row } = params

        if (row?.http_status_code?.toLowerCase() === 'unknown' || row?.http_status_code == 0) {
          row.http_status_code = ''
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
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                width: '100%',
                overflow: 'hidden',
                textoverflow: 'ellipsis'
              }}
            >
              <Typography title={row?.http_status_code} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.http_status_code}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'tls_version',
      align: 'center',
      headerAlign: 'center',
      headerName: t('TLS Version'),
      renderCell: params => {
        const { row } = params

        if (row?.tls_version?.toLowerCase() === 'unknown') {
          row.tls_version = ''
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
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                width: '100%',
                overflow: 'hidden',
                textoverflow: 'ellipsis'
              }}
            >
              <Typography title={row?.tls_version} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.tls_version}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.025,
      field: 'type',
      minWidth: 100,
      headerName: t('Type'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = theme.palette.mode === 'light' ? 'secondary' : 'secondary'
        let label = t('UNKNOWN')
        let iconImage = 'mdi:help-circle-outline'

        if (row?.type?.toLowerCase() === 'httpurl') {
          label = t('URL PROBE')
          iconImage = 'mdi:web'
        } else if (row?.type?.toLowerCase() === 'tcpport') {
          label = t('TCP PROBE')
          iconImage = 'mdi:lan-connect'
        } else if (row?.type?.toLowerCase() === 'api') {
          label = t('API PROBE')
          iconImage = 'mdi:api'
        } else if (row?.type?.toLowerCase() === 'icmpping') {
          label = t('PING PROBE')
          iconImage = 'mdi:ping-pong'
        } else if (row?.type?.toLowerCase() === 'sslport') {
          label = t('SSL PROBE')
          iconImage = 'mdi:lan-connect'
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
                label={label || t('UNKNOWN')}
                color={color}
                icon={<Icon icon={iconImage} />}
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
      field: 'createdAtTime',
      headerName: t('Created At'),
      renderCell: params => {
        const { row } = params

        let humanReadableDate = ''

        if (row.created_at) {
          humanReadableDate = formatInTimeZone(
            parseISO(row.created_at),
            timezone || 'UTC', // Default to 'UTC' if timezone is undefined
            'MMM d, yyyy, h:mm:ss aa zzz'
          )
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
            <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={humanReadableDate} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {humanReadableDate}
              </Typography>
            </Box>
          </Box>
        )
      }
    },

    // {
    //   flex: 0.02,
    //   minWidth: 60,
    //   field: 'updatedAtTime',
    //   headerName: t('Updated At'),
    //   renderCell: params => {
    //     const { row } = params

    //     const timezone = session?.data?.user?.timezone || 'US/Eastern'

    //     const humanReadableDate = formatInTimeZone(
    //       utcToZonedTime(parseISO(row?.modified_at), timezone),
    //       timezone,
    //       'MMM d, yyyy, h:mm:ss aa zzz'
    //     )

    //     return (
    //       <Box
    //         sx={{
    //           display: 'flex',
    //           alignItems: 'center', // Ensures vertical centering inside the Box
    //           justifyContent: 'flex-start',
    //           width: '100%', // Ensures the Box takes full width of the cell
    //           height: '100%' // Ensures the Box takes full height of the cell
    //         }}
    //       >
    //         <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', textoverflow: 'ellipsis' }}>
    //           <Typography title={humanReadableDate} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
    //             {humanReadableDate}
    //           </Typography>
    //         </Box>
    //       </Box>
    //     )
    //   }
    // },
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
                title={row?.status?.toLowerCase() === 'enabled' ? t('Disable Probe') : t('Enable Probe')}
                aria-label={row?.status?.toLowerCase() === 'enabled' ? t('Disable Probe') : t('Enable Probe')}
                color={row?.status?.toLowerCase() === 'enabled' ? 'success' : 'secondary'}
                onClick={() => {
                  setCurrentProbe(row)
                  setDisableDialog(true)
                }}
                disabled={!ability.can('update', 'probes')}
              >
                <Icon icon={row?.status?.toLowerCase() === 'enabled' ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} />
              </IconButton>
              {/* <IconButton
                size='small'
                title={t('Edit Probe')}
                color='secondary'
                aria-label={t('Edit Probe')}
                onClick={() => {
                  setCurrentProbe(row)
                  setEditDialog(true)
                }}
                disabled={!ability.can('update', 'probes')}
              >
                <Icon icon='mdi:edit' />
              </IconButton> */}
              <IconButton
                size='small'
                title={t('Delete Probe')}
                aria-label={t('Delete Probe')}
                color='error'
                onClick={() => {
                  setCurrentProbe(row)
                  setDeleteDialog(true)
                }}
                disabled={!ability.can('delete', 'probes')}
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

  const handleExportDialogClose = () => setExportDialog(false)

  const handleExportDialogConfirm = () => {
    exportProbes()
    setExportDialog(false)
  }

  const ExportDialog = () => (
    <Dialog open={exportDialog} onClose={handleExportDialogClose} aria-labelledby='export-dialog-title'>
      <DialogTitle id='export-dialog-title'>{t('Confirm Export')}</DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleExportDialogClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <Typography>{t('Are you sure you want to export the probes?')}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleExportDialogClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleExportDialogConfirm}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:export' />}
        >
          {t('Export')}
        </Button>
      </DialogActions>
    </Dialog>
  )

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
              {currentProbe?.name?.toUpperCase() ?? ''}
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
              {currentProbe?.id ?? ''}
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
              {t('Edit Probe Information')}
            </Typography>
            <Typography variant='body2'>{t('Updates to probe information will be effective immediately.')}</Typography>
          </Box>
          {currentProbe && (
            <UpdateProbeWizard
              currentProbe={currentProbe}
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
                <Typography variant='h6'>{t('Confirm you want to delete this probe?')}</Typography>
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

  const DisableDialog = () => {
    const isProbeEnabled = currentProbe?.status?.toLowerCase() === 'enabled'

    return (
      <Dialog
        open={disableDialog}
        onClose={handleDisableDialogClose}
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
              {t('Confirm Action')}
            </Typography>
            <IconButton size='small' onClick={handleDisableDialogClose} aria-label='close'>
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
                  {isProbeEnabled
                    ? t('Confirm you want to disable this probe.')
                    : t('Confirm you want to enable this probe.')}
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
            color='primary'
            autoFocus
            startIcon={<Icon icon={isProbeEnabled ? 'mdi:pause-circle' : 'mdi:play-circle'} />}
          >
            {isProbeEnabled ? t('Disable') : t('Enable')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleDisableDialogClose}
            color='secondary'
            startIcon={<Icon icon='mdi:close' />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const handleDisableDialogSubmit = async () => {
    const isCurrentlyEnabled = currentProbe?.status === 'enabled'
    const probeId = currentProbe?.id

    if (!probeId) {
      console.error('Probe ID is undefined')
      toast.error(t('Probe ID is undefined or invalid'))

      return
    }

    const apiToken = session?.data?.user?.apiToken // Assume apiToken is retrieved from the session

    console.log('Probe status:', isCurrentlyEnabled ? 'enabled' : 'disabled')
    console.log('Current Probe Status:', currentProbe?.status)

    // Determine the correct endpoint URL based on the probe's current status
    const endpoint = isCurrentlyEnabled ? `/api/probes/disable/${probeId}` : `/api/probes/enable/${probeId}`

    console.log('Endpoint:', endpoint)

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
        // Update UI to reflect the probe's new status
        const newStatus = isCurrentlyEnabled ? 'disabled' : 'enabled'
        const updatedRows = rows.map(row => (row.id === probeId ? { ...row, status: newStatus } : row))
        setRows(updatedRows)

        // Show success message
        toast.success(`${t('Probe')} ${newStatus === 'enabled' ? t('Enabled') : t('Disabled')}`)
      } else {
        // Handle unsuccessful update
        toast.error(`${t('Failed to')} ${isCurrentlyEnabled ? t('Disable') : t('Enable')} ${t('Probe')}`)
      }
    } catch (error) {
      console.error(`${t('Failed to')} ${isCurrentlyEnabled ? t('Disable') : t('Enable')} ${t('Probe')}`, error)
      toast.error(`${t('Failed to')} ${isCurrentlyEnabled ? t('Disable') : t('Enable')} ${t('Probe')}`)
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

      // console.log('Deleting Probe:', currentProbe)

      const endpoint = `/api/probes/delete/${currentProbe.id}`

      // console.log('DELETE Endpoint:', endpoint)
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentProbe.id)

        setRows(updatedRows)
        setDeleteDialog(false)

        // props.set_total(props.total - 1)
        toast.success(t('Successfully deleted Probe'))

        // Wait for a short delay before triggering the refetch
        setTimeout(() => {
          setRefetchTrigger(Date.now())
        }, 5000) // Adjust the delay as needed
      }
    } catch (error) {
      console.error('Failed to delete Probe', error)
      toast.error(t('Failed to delete Probe'))
    }
  }

  // Use an effect to synchronize the DataGrid's selection model with probeIds
  useEffect(() => {
    // This updates the DataGrid's selection model whenever probeIds changes
    setRowSelectionModel(probeIds)
  }, [probeIds])

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async filterModel => {
      setLoading(true)

      try {
        const response = await axios.get('/api/probes', {
          params: {
            sort: sortModel[0]?.sort || 'asc',
            column: sortModel[0]?.field || 'name',
            skip: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            filter: JSON.stringify(filterModel)
          },
          // Add signal from AbortController to handle timeouts more gracefully
          signal: new AbortController().signal,
          timeout: 30000
        })

        // If we get here, we have successful data
        setRowCount(response.data.total_records)
        setRows(response.data.records)
        props.set_total(response.data.total_records)
        setProbes(response.data.records)
      } catch (error) {
        // Only show error toast if it's not a timeout and we don't have data
        if (error.code !== 'ECONNABORTED' && rows.length === 0) {
          console.error('Failed to fetch probes:', error)
          toast.error(t('Failed to fetch probes'))
        }
      } finally {
        setLoading(false)
        setRunFilterQuery(false)
        setRunRefresh(false)
      }
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
    // console.log('Effect Run:', { itemsLength: filterModel.items.length, runFilterQuery })
    // console.log('Filter Model:', JSON.stringify(filterModel))

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModel, runFilterQuery]) // Triggered by filter changes

  useEffect(() => {
    fetchData()
  }, [fetchData, refetchTrigger])

  useEffect(() => {
    if (runRefresh) {
      fetchData()
    }

    // Reset the runRefresh flag
    return () => {
      runRefresh && setRunRefresh(false)
    }
  }, [fetchData, runRefresh])

  // Trigger based on sort
  useEffect(() => {
    // console.log('Effect Run:', { sortModel, runFilterQuery })
    // console.log('Sort Model:', JSON.stringify(sortModel))

    if (sortingMode === 'server') {
      fetchData()
    } else {
      // client side sorting
      const column = sortModel[0]?.field
      const sort = sortModel[0]?.sort

      // console.log('Column:', column)
      // console.log('Sort:', sort)

      // console.log('Rows:', rows)

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
    // console.log('Search Value:', value)

    setSearchValue(value)
    const searchRegex = new RegExp(escapeRegExp(value), 'i')

    const filteredRows = rows.filter(row => {
      // console.log('Row:', row)

      // Extend the search to include nested paths
      const searchFields = ['id', 'name', 'status', 'type', 'description']

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

  const handleRowSelection = newRowSelectionModel => {
    const addedIds = newRowSelectionModel.filter(id => !rowSelectionModel.includes(id))

    // console.log('Added IDs:', addedIds)

    addedIds.forEach(id => {
      const row = rows.find(r => r.id === id)

      // console.log('Added Row:', row)
    })

    // Update the row selection model
    setRowSelectionModel(newRowSelectionModel)

    // Update the Jotai atom with the new selection model
    setProbeIds(newRowSelectionModel)
  }

  // Hidden columns
  const hiddenFields = ['id']

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  const exportProbes = useCallback(() => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Probes')

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Target', key: 'target', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Description', key: 'description', width: 50 }
    ]

    const dataToExport = filteredRows.length ? filteredRows : rows

    dataToExport.forEach(row => {
      worksheet.addRow({
        name: row.name,
        type: row.type === 'httpurl' ? 'URL' : 'Port',
        target: row.target,
        status: row.status,
        description: row.description
      })
    })

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, 'probes_export.xlsx')
    })
  }, [rows, filteredRows])

  useImperativeHandle(ref, () => ({
    exportProbes: () => setExportDialog(true)
  }))

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
          getDetailPanelHeight={getDetailPanelHeight}
          getDetailPanelContent={getDetailPanelContent}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          onDetailPanelExpandedRowIdsChange={handleDetailPanelExpandedRowIdsChange}
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
              message: t('No Probes found')
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
                  color:
                    theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main,
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
        <ExportDialog />
      </Card>
    </Box>
  )
})

export default ActiveProbes
