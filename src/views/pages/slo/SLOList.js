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
import { parseISO, formatDistance } from 'date-fns'
import { format, zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz'
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
import { sloIdsAtom, slosAtom, refetchSloTriggerAtom } from 'src/lib/atoms'
import UpdateSLOWizard from 'src/views/pages/slo/forms/UpdateSLOWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'

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

const SLOList = props => {
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
  const [sloIds, setSloIds] = useAtom(sloIdsAtom)
  const [slos, setSlos] = useAtom(slosAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchSloTriggerAtom)

  // ** Dialog
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [disableDialog, setDisableDialog] = useState(false)
  const [currentSlo, setCurrentSlo] = useState(null)

  const editmode = false

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
      field: 'target_type',
      editable: editmode,
      headerName: t('Budgeting Method'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row?.target?.calculation_method?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'target_value',
      editable: editmode,
      headerName: t('Target Value (%)'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row?.target?.target_value}%
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'target_period',
      editable: editmode,
      headerName: t('Target Rolling Period (days)'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row?.target?.period} days
              </Typography>
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

        const timezone = session?.data?.user?.timezone || 'US/Eastern'

        const humanReadableDate = formatInTimeZone(
          utcToZonedTime(parseISO(row?.created_at), timezone),
          timezone,
          'MMM d, yyyy, h:mm:ss aa zzz'
        )

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

        const timezone = session?.data?.user?.timezone || 'US/Eastern'

        const humanReadableDate = formatInTimeZone(
          utcToZonedTime(parseISO(row?.modified_at), timezone),
          timezone,
          'MMM d, yyyy, h:mm:ss aa zzz'
        )

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
              title='Edit Task'
              color='secondary'
              aria-label='Edit Task'
              onClick={() => {
                setCurrentSlo(row)
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
                setCurrentSlo(row)
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

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false)
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
              {currentSlo?.name?.toUpperCase() ?? ''}
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
              {currentSlo?.id ?? ''}
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
              Edit Service Level Objective
            </Typography>
            <Typography variant='body2'>Updates to SLO information will be effective immediately.</Typography>
          </Box>
          {currentSlo && (
            <UpdateSLOWizard currentSlo={currentSlo} rows={rows} setRows={setRows} onClose={handleUpdateDialogClose} />
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
              {currentSlo?.name?.toUpperCase() ?? ''}
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
              {currentSlo?.id ?? ''}
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
                  Please confirm that you want to delete this SLO.
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

  const handleDeleteDialogSubmit = async () => {
    try {
      const apiToken = session?.data?.user?.apiToken

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
      }

      // console.log('Deleting SLO:', currentSlo)

      const endpoint = `/api/sli/${currentSlo.id}`

      console.log('DELETE Endpoint:', endpoint)
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentSlo.id)

        setRows(updatedRows)
        setDeleteDialog(false)

        // props.set_total(props.total - 1)

        setRefetchTrigger(Date.now())

        toast.success('Successfully deleted SLO')
      }
    } catch (error) {
      console.error('Failed to delete SLO', error)
      toast.error('Failed to delete SLO')
    }
  }

  // Use an effect to synchronize the DataGrid's selection model with sloIds
  useEffect(() => {
    // This updates the DataGrid's selection model whenever sloIds changes
    setRowSelectionModel(sloIds)
  }, [sloIds])

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async (sort, q, column) => {
      let data = []

      setLoading(true)
      await axios
        .get('/api/sli', {
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
          setSlos(data)
        })

      await loadServerRows(paginationModel.page, paginationModel.pageSize, data).then(slicedRows => setRows(slicedRows))
      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel.page, paginationModel.pageSize, setSlos]
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
    setSloIds(newRowSelectionModel)
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
          components={{
            Toolbar: ServerSideToolbar,
            NoRowsOverlay: () => <NoRowsOverlay message='No SLOs Found' />,
            NoResultsOverlay: () => <NoResultsOverlay message='No Results Found' />
          }}
          onRowSelectionModelChange={newRowSelectionModel => handleRowSelection(newRowSelectionModel)}
          rowSelectionModel={rowSelectionModel}
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
              showexport: false
            }
          }}
        />
        <EditDialog />
        <DeleteDialog />
      </Card>
    </Box>
  )
}

export default SLOList
