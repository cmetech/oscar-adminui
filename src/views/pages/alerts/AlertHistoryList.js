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
import AlertDetailPanel from 'src/views/pages/alerts/AlertDetailPanel'
import { alertGroupIdsAtom, alertGroupsAtom, refetchServerTriggerAtom } from 'src/lib/atoms'
import { setRef } from '@mui/material'

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

const AlertsList = props => {
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
  const [alertGroupIds, setAlertGroupIds] = useAtom(alertGroupIdsAtom)
  const [alertGroups, setAlertGroups] = useAtom(alertGroupsAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchServerTriggerAtom)

  // ** Dialog
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [currentServer, setCurrentServer] = useState(null)

  const editmode = false

  
  const getDetailPanelContent = useCallback(({ row }) => <AlertDetailPanel alertGroup={row} />, [])
  const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  // column definitions
  const columns = [
    {
      flex: 0.035,
      minWidth: 100,
      field: 'id',
      editable: editmode,
      headerName: t('AlertGroupId'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledLink href='#'>{String(row?.id).toUpperCase()}</StyledLink>
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
      flex: 0.03,
      minWidth: 100,
      field: 'receiver',
      editable: editmode,
      headerName: t('Receiver'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledLink href='#'>{row?.receiver?.toUpperCase()}</StyledLink>
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
                {row?.receiver?.toUpperCase()}
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
        if (row?.status?.toLowerCase() === 'firing') {
          color = 'success'
          label = 'ACTIVE'
        } if (row?.status?.toLowerCase() === 'pending') {
          color = 'success'
          label = 'ACTIVE'
        } if (row?.status?.toLowerCase() === 'resolved') {
          color = 'success'
          label = 'ACTIVE'
        } 
        else {
          color = 'error'
          label = 'INACTIVE'
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CustomChip
                rounded
                size='small'
                skin='light'
                label={label || 'UNKN'}
                color={color}
                sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
              />
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.025,
      minWidth: 100,
      field: 'groupKey',
      editable: editmode,
      headerName: t('GroupKey'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledLink href='#'>{row?.groupKey?.toUpperCase()}</StyledLink>
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
                {row?.groupKey?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    }/*,
    {
      flex: 0.025,
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
    },*/
  ]

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async (sort, q, column) => {
      let data = []

      setLoading(true)
      await axios
        .get('/api/alertmanager', {
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
          setAlertGroups(data)
        })

      await loadServerRows(paginationModel.page, paginationModel.pageSize, data).then(slicedRows => setRows(slicedRows))
      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel.page, paginationModel.pageSize, setAlertGroups]
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
      setSortColumn('id')
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
    setAlertGroupIds(newRowSelectionModel)
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
          sortingMode='status'
          paginationMode='status'
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
      </Card>
    </Box>
  )
}

export default AlertsList
