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
import UpdateSubcomponentWizard from 'src/views/pages/inventory/forms/UpdateSubcomponentWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

import { subcomponentIdsAtom, subcomponentsAtom, refetchSubcomponentTriggerAtom, timezoneAtom } from 'src/lib/atoms'

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

const SubcomponentsList = props => {
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

  // const [sort, setSort] = useState('asc')
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }])

  // ** State
  const [searchValue, setSearchValue] = useState('')

  // const [sortColumn, setSortColumn] = useState('name')
  const [pinnedColumns, setPinnedColumns] = useState({})
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])

  // ** Dialog
  const [openDialog, setOpenDialog] = useState(false)
  const [deactivateDialog, setDeactivateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [currentSubcomponent, setCurrentSubcomponent] = useState(null)
  const [subcomponents, setSubcomponents] = useAtom(subcomponentsAtom)
  const [subcomponentIds, setSubcomponentIds] = useAtom(subcomponentIdsAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchSubcomponentTriggerAtom)
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
      headerName: t('Identifier')
    },
    {
      flex: 0.25,
      minWidth: 100,
      field: 'name',
      editable: editmode,
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
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap>{row?.name?.toUpperCase()}</Typography>
              <Typography
                noWrap
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
      flex: 0.5,
      minWidth: 100,
      field: 'specification',
      editable: editmode,
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
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap>{row?.specifications?.toUpperCase()}</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'actions',
      headerName: t('Actions'),
      type: 'string',
      flex: 0.2,
      minWidth: 10,
      renderCell: params => {
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
                title='Edit'
                aria-label='Edit'
                onClick={() => {
                  setCurrentSubcomponent(params.row)
                  setOpenDialog(true)
                }}
              >
                <Icon icon='mdi:pencil' />
              </IconButton>
              <IconButton
                size='small'
                title='Delete Component'
                aria-label='Delete Component'
                color='error'
                onClick={() => {
                  setCurrentSubcomponent(params.row)
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

  const handleUpdateSubcomponentDialogClose = () => {
    setOpenDialog(false)
  }

  const handleDisableSubcomponentDialogClose = () => {
    setDeactivateDialog(false)
  }

  const handleDeleteSubcomponentDialogClose = () => {
    setDeleteDialog(false)
  }

  const EditDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={openDialog}
        onClose={handleUpdateSubcomponentDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentSubcomponent?.name?.toUpperCase() ?? ''}
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
              {currentSubcomponent?.id ?? ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
            size='small'
            onClick={() => handleUpdateSubcomponentDialogClose()}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              Edit Subcomponent Information
            </Typography>
            <Typography variant='body2'>Updates to subcomponent information will be effective immediately.</Typography>
          </Box>
          <UpdateSubcomponentWizard
            currentSubcomponent={currentSubcomponent}
            rows={rows}
            setRows={setRows}
            onClose={handleUpdateSubcomponentDialogClose}
          />
        </DialogContent>
      </Dialog>
    )
  }

  const DeleteDialog = () => {
    return (
      <Dialog
        open={deleteDialog}
        onClose={handleDeleteSubcomponentDialogClose}
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
            <IconButton size='small' onClick={handleDeleteSubcomponentDialogClose} aria-label='close'>
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
                <Typography variant='h6'>{t('Confirm you want to delete this subcomponent?')}</Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleDeleteSubcomponentDialogSubmit}
            color='error'
            autoFocus
            startIcon={<Icon icon='mdi:delete-forever' />}
          >
            {t('Delete')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleDeleteSubcomponentDialogClose}
            color='secondary'
            startIcon={<Icon icon='mdi:close' />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const handleDeleteSubcomponentDialogSubmit = async () => {
    try {
      const apiToken = session?.data?.user?.apiToken

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}` // Include the bearer token in the Authorization header
      }

      const endpoint = `/api/inventory/subcomponents/${currentSubcomponent.id}`
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.id !== currentSubcomponent.id)

        setRows(updatedRows)
        setDeleteDialog(false)

        setRefetchTrigger(Date.now())

        toast.success('Subcomponent successfully deleted')
      }
    } catch (error) {
      console.error('Error deleting subcomponent', error)
      toast.error('Error deleting of subcomponent')
    }
  }

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async () => {
      setLoading(true)
      await axios
        .get('/api/inventory/subcomponents', {
          params: {}
        })
        .then(res => {
          setRowCount(res.data.total)
          setRows(res.data.rows)
          props.set_total(res.data.total)
          setSubcomponents(res.data.rows)
        })

      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSubcomponents, setRows]
  )

  useEffect(() => {
    fetchData()
  }, [refetchTrigger, fetchData])

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
    // console.log('Search Value:', value)

    setSearchValue(value)
    const searchRegex = new RegExp(escapeRegExp(value), 'i')

    const filteredRows = rows.filter(row => {
      // console.log('Row:', row)

      // Extend the search to include nested paths
      const searchFields = ['id', 'name', 'specification']

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

    console.log('Added IDs:', addedIds)

    addedIds.forEach(id => {
      const row = rows.find(r => r.id === id)
      console.log('Added Row:', row)
    })

    // Update the row selection model
    setRowSelectionModel(newRowSelectionModel)

    // Update the Jotai atom with the new selection model
    setSubcomponentIds(newRowSelectionModel)
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
          localeText={{
            toolbarColumns: t('Columns'),
            toolbarFilters: t('Filters')
          }}
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
              message: 'No Subcomponents found'
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
        <EditDialog />
        <DeleteDialog />
      </Card>
    </Box>
  )
}

export default SubcomponentsList
