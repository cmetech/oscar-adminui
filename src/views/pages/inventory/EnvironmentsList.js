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
import UpdateEnvironmentWizard from 'src/views/pages/inventory/forms/UpdateEnvironmentWizard'

import { environmentsAtom, refetchEnvironmentTriggerAtom } from 'src/lib/atoms'
import { capitalizeWords } from 'src/lib/utils'
import { useAtom } from 'jotai'

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

const userRoleObj = {
  admin: { icon: 'mdi:cog-outline', color: 'error.main' },
  regular: { icon: 'mdi:account-outline', color: 'info.main' },
  unknown: { icon: 'mdi:account-question-outline', color: 'warning.main' }
}

const EnvironmentsList = props => {
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

  // ** Dialog
  const [openDialog, setOpenDialog] = useState(false)
  const [deactivateDialog, setDeactivateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [currentEnvironment, setCurrentEnvironment] = useState(null)
  const [environments, setEnvironments] = useAtom(environmentsAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchEnvironmentTriggerAtom)

  const editmode = false

  // column definitions
  const columns = [
    {
      flex: 0.04,
      minWidth: 100,
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
                {row?.datacenter_name?.toUpperCase()}
              </Typography>
            </Box>
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CustomChip
                rounded
                size='small'
                skin='light'
                label={label || 'UNKN'}
                color={color}
                icon={<Icon icon='mdi:server' />}
                sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
              />
            </Box>
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CustomChip
                rounded
                size='small'
                skin='light'
                label={label || 'UNKN'}
                color={color}
                icon={<Icon icon='mdi:server-off' />}
                sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
              />
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.05,
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
                {capitalizeWords(row?.description)}
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
      flex: 0.05,
      minWidth: 100,
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
      headerName: 'Actions',
      type: 'string',
      flex: 0.025,
      minWidth: 10,
      renderCell: params => {
        return (
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
            <IconButton
              size='small'
              title='Edit'
              aria-label='Edit'
              onClick={() => {
                setCurrentEnvironment(params.row)
                setOpenDialog(true)
              }}
            >
              <Icon icon='mdi:file-edit' />
            </IconButton>
            <IconButton
              size='small'
              title='Delete Environment'
              aria-label='Delete Environment'
              color='error'
              onClick={() => {
                setCurrentEnvironment(params.row)
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
    setOpenDialog(false)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false)
  }

  const EditDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={openDialog}
        onClose={handleUpdateDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentEnvironment?.name?.toUpperCase() ?? ''}
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
              {currentEnvironment?.id ?? ''}
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
              Edit Environment Information
            </Typography>
            <Typography variant='body2'>Updates to environment information will be effective immediately.</Typography>
          </Box>
          <UpdateEnvironmentWizard currentEnvironment={currentEnvironment} rows={rows} setRows={setRows} />
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
              {currentEnvironment?.name?.toUpperCase() ?? ''}
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
              {currentEnvironment?.id ?? ''}
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
                  Please confirm that you want to delete this environment. This action cannot be undone. All Servers
                  associated with this environment will also be deleted.
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

      const endpoint = `/api/inventory/environments/${currentEnvironment.id}`
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentEnvironment.id)

        setRows(updatedRows)
        setDeleteDialog(false)

        // props.set_total(props.total - 1)

        setRefetchTrigger(Date.now())

        toast.success('Successfully deleted environment')
      }
    } catch (error) {
      console.error('Failed to delete Environment', error)
      toast.error('Failed to delete Environment')
    }
  }

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async (sort, q, column) => {
      let data = []

      setLoading(true)
      await axios
        .get('/api/inventory/environments', {
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
          setEnvironments(data)
        })

      await loadServerRows(paginationModel.page, paginationModel.pageSize, data).then(slicedRows => setRows(slicedRows))
      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel.page, paginationModel.pageSize]
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

  const handleRowSelection = rowid => {
    setRowSelectionModel(rowids)
  }

  return (
    <Box>
      <Card sx={{ position: 'relative' }}>
        <CardHeader title={t(props.type)} sx={{ textTransform: 'capitalize' }} />
        <CustomDataGrid
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
          checkboxSelection={false}
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
              showButtons: false
            }
          }}
        />
        <EditDialog />
        <DeleteDialog />
      </Card>
    </Box>
  )
}

export default EnvironmentsList
