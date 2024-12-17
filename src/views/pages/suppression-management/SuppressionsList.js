import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useContext, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { useAtom } from 'jotai'
import { DataGridPro, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'
import { useSession } from 'next-auth/react'
import { formatInTimeZone, parseISO } from 'date-fns-tz'
import dayjs from 'src/lib/dayjs-config'
import { getTimezoneAbbreviation } from 'src/lib/utils'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Icon from 'src/@core/components/icon'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import CardHeader from '@mui/material/CardHeader'

// ** Custom Components
import { CustomDataGrid } from 'src/lib/styled-components'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import CustomChip from 'src/@core/components/mui/chip'
import { escapeRegExp, getNestedValue } from 'src/lib/utils'
import UpdateSuppressionForm from 'src/views/pages/suppression-management/forms/UpdateSuppressionForm'

// ** Atoms
import { suppressionIdsAtom, refetchSuppressionsTriggerAtom, timezoneAtom } from 'src/lib/atoms'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const SuppressionsList = forwardRef((props, ref) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const ability = useContext(AbilityContext)
  const apiRef = useGridApiRef()
  const session = useSession()
  const [timezone] = useAtom(timezoneAtom)
  const userTimezone = timezone || 'UTC'

  // ** Destructure new props
  const { rowSelectionModel, setRowSelectionModel, suppressions, setSuppressions } = props

  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }])
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [filterMode, setFilterMode] = useState('server')
  const [sortingMode, setSortingMode] = useState('server')
  const [paginationMode, setPaginationMode] = useState('server')
  const [filteredRows, setFilteredRows] = useState([])
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [rowCountState, setRowCountState] = useState(0)

  // ** States
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentSuppression, setCurrentSuppression] = useState(null)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suppressionToDelete, setSuppressionToDelete] = useState(null)
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [runRefresh, setRunRefresh] = useState(false)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchSuppressionsTriggerAtom)
  const [selectedIds, setSelectedIds] = useAtom(suppressionIdsAtom)

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchSuppressions()
    }
  }))

  const fetchSuppressions = useCallback(
    async (filterModelParam = filterModel) => {
      setLoading(true)
      try {
        // Prepare filter parameters
        let filters = null
        if (filterModelParam.items.length > 0) {
          filters = JSON.stringify({
            items: filterModelParam.items.map(item => ({
              field: item.field,
              operator: item.operator,
              value: item.value
            })),
            logicOperator: filterModelParam.logicOperator
          })
        }

        // Validate pagination parameters
        const page = Math.max(1, paginationModel.page + 1) // MUI DataGrid uses 0-based indexing
        const perPage = Math.min(100, Math.max(1, paginationModel.pageSize)) // Ensure within bounds

        const params = {
          page,
          perPage,
          ...(filters && { filters }), // Only include filters if they exist
          ...(sortModel.length > 0 && {
            // Only include sort if it exists
            order: sortModel[0].sort || 'asc',
            column: sortModel[0].field || 'name'
          })
        }

        const response = await axios.get('/api/suppressions', { params })

        if (response.data) {
          const { windows, total_windows, total_pages } = response.data

          // Update state with fetched data
          setSuppressions(windows || [])
          setRowCount(total_windows || 0)
          setRowCountState(total_windows || 0)

          // Update parent component if needed
          if (props.setSuppressionsTotal) {
            props.setSuppressionsTotal(total_windows || 0)
          }
        } else {
          throw new Error('No data received from server')
        }
      } catch (error) {
        console.error('Error fetching suppressions:', error)
        toast.error(error.response?.data?.message || t('Failed to fetch suppressions'))
      } finally {
        setLoading(false)
        setRunRefresh(false)
        setRunFilterQuery(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel, sortModel, filterModel]
  )

  useEffect(() => {
    setRows(suppressions)
  }, [suppressions])

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  useEffect(() => {
    if (!runFilterQuery) {
      fetchSuppressions()
    }

    const intervalId = setInterval(fetchSuppressions, 300000) // Fetch data every 300 seconds (5 minutes)

    return () => clearInterval(intervalId) // Cleanup interval on component unmount
  }, [fetchSuppressions, refetchTrigger, runFilterQuery])

  // Trigger based on filter application
  useEffect(() => {
    // console.log('Effect Run:', { itemsLength: filterModel.items.length, runFilterQuery })
    // console.log('Filter Model:', JSON.stringify(filterModel))

    if (runFilterQuery && filterModel.items.length > 0) {
      if (filterMode === 'server') {
        const sort = sortModel[0]?.sort
        const sortColumn = sortModel[0]?.field
        fetchSuppressions(filterModel)
      } else {
        // client side filtering
        const filteredRows = rows.filter(row => {
          return filterModel.items.every(filterItem => {
            const { field, operator, value } = filterItem
            const cellValue = row[field]

            switch (operator) {
              case 'contains':
                return cellValue.toLowerCase().includes(value.toLowerCase())
              case 'equals':
                return cellValue.toLowerCase() === value.toLowerCase()
              case 'startsWith':
                return cellValue.toLowerCase().startsWith(value.toLowerCase())
              case 'endsWith':
                return cellValue.toLowerCase().endsWith(value.toLowerCase())
              case 'isEmpty':
                return !cellValue || cellValue.length === 0
              case 'isNotEmpty':
                return cellValue && cellValue.length > 0
              default:
                return true
            }
          })
        })

        setRows(filteredRows)
      }
      setRunFilterQueryCount(prevRunFilterQueryCount => (prevRunFilterQueryCount += 1))
    } else if (runFilterQuery && filterModel.items.length === 0 && runFilterQueryCount > 0) {
      if (filterMode === 'server') {
        fetchSuppressions(filterModel)
      } else {
        // client side filtering
        setRows(rows)
      }
      setRunFilterQueryCount(0)
    } else {
      console.log('Conditions not met', { itemsLength: filterModel.items.length, runFilterQuery })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModel, runFilterQuery]) // Triggered by filter changes

  // Trigger based on sort
  useEffect(() => {
    // console.log('Effect Run:', { sortModel, runFilterQuery })
    // console.log('Sort Model:', JSON.stringify(sortModel))

    if (sortingMode === 'server') {
      fetchSuppressions()
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

  useEffect(() => {
    fetchSuppressions()
  }, [fetchSuppressions, refetchTrigger])

  useEffect(() => {
    if (runRefresh) {
      fetchSuppressions()
    }

    // Reset the runRefresh flag
    return () => {
      runRefresh && setRunRefresh(false)
    }
  }, [fetchSuppressions, runRefresh])

  // ** Dialogs
  const DeleteDialog = () => {
    return (
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
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
            <Box>
              <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {t('Confirm Deletion')}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandBlue
                      : theme.palette.customColors.brandYellow
                }}
              >
                {suppressionToDelete?.name?.toUpperCase()}
              </Typography>
            </Box>
            <IconButton size='small' onClick={handleCancelDelete} aria-label='close'>
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
                <Typography variant='h6'>{t('Confirm deletion of suppression window')}</Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            color='error'
            onClick={handleConfirmDelete}
            startIcon={<Icon icon='mdi:delete-forever' />}
          >
            {t('Delete')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            color='secondary'
            onClick={handleCancelDelete}
            startIcon={<Icon icon='mdi:close' />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const handleEdit = suppression => {
    setCurrentSuppression(suppression)
    setEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setCurrentSuppression(null)
    fetchSuppressions()
  }

  const handleDelete = suppression => {
    setSuppressionToDelete(suppression)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = useCallback(async () => {
    if (!suppressionToDelete) {
      toast.error(t('No suppression window selected for deletion'))

      return
    }

    try {
      const encodedId = encodeURIComponent(suppressionToDelete.id)
      await axios.delete(`/api/suppressions/${encodedId}`)

      // Success handling
      toast.success(t('Suppression window deleted successfully'))

      // Update local state
      setSuppressions(prevSuppressions => prevSuppressions.filter(s => s.name !== suppressionToDelete.name))

      // Reset selection states
      setRowSelectionModel([])
      setSelectedIds([])

      // Close dialog and clear deletion target
      setDeleteDialogOpen(false)
      setSuppressionToDelete(null)

      // Trigger refresh
      setRefetchTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error deleting suppression:', error)

      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error(t('Suppression window not found'))
      } else if (error.response?.status === 403) {
        toast.error(t('You do not have permission to delete this suppression window'))
      } else {
        toast.error(error.response?.data?.message || t('Failed to delete suppression window'))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppressionToDelete, setRefetchTrigger, setSelectedIds])

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setSuppressionToDelete(null)
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
      props.setSuppressionsTotal(filteredRows.length)
    } else {
      setFilteredRows([])
      setRowCount(rows.length)
      props.setSuppressionsTotal(rows.length)
    }
  }

  // ** Update the handleRowSelection function
  const handleRowSelection = newRowSelectionModel => {
    setRowSelectionModel(newRowSelectionModel)
  }

  // Hidden columns
  const hiddenFields = ['id']

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  const columns = [
    {
      flex: 0.2,
      minWidth: 150,
      field: 'name',
      headerName: t('Name'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
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
      flex: 0.25,
      field: 'time_window',
      headerName: t('Time Window'),
      renderCell: params => {
        const { row } = params
        const originalTimezone = row.timezone || 'UTC'

        // Convert times to user's timezone
        const startTime = dayjs().tz(originalTimezone).hour(row.start_hour).minute(row.start_minute).tz(userTimezone)

        const endTime = dayjs().tz(originalTimezone).hour(row.end_hour).minute(row.end_minute).tz(userTimezone)

        const userTzAbbr = getTimezoneAbbreviation(userTimezone)
        const originalTzAbbr = getTimezoneAbbreviation(originalTimezone)

        const timeWindowText = `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`

        // Only include valid_from and valid_until in caption if they exist
        const validFromDate = row.valid_from
          ? formatInTimeZone(parseISO(row.valid_from), userTimezone, 'yyyy-MM-dd')
          : null

        const validUntilDate = row.valid_until
          ? formatInTimeZone(parseISO(row.valid_until), userTimezone, 'yyyy-MM-dd')
          : null

        // Build caption text conditionally
        let captionText = `timezone: ${userTzAbbr} (created in ${originalTzAbbr})`
        if (validFromDate && validUntilDate) {
          captionText += `, valid: ${validFromDate} - ${validUntilDate}`
        } else if (validFromDate) {
          captionText += `, valid from: ${validFromDate}`
        } else if (validUntilDate) {
          captionText += `, valid until: ${validUntilDate}`
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'} sx={{ fontWeight: 600 }}>
                {timeWindowText}
              </Typography>
              <Typography
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
                {captionText}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'days',
      headerName: t('Days'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {row.days_of_week
                  .split(',')
                  .map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)])
                  .join(', ')}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      field: 'recurring',
      align: 'center',
      headerAlign: 'center',
      headerName: t('Recurring'),
      renderCell: params => {
        const { row } = params

        const isRecurring = row.is_recurring
        const label = isRecurring ? t('Yes') : t('No')
        const color = isRecurring ? 'success' : 'warning'

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
      flex: 0.05,
      sortable: false,
      field: 'actions',
      headerName: t('Actions'),
      type: 'actions',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Tooltip title={t('Edit')}>
              <IconButton onClick={() => handleEdit(row)} size='small'>
                <Icon icon='mdi:edit' fontSize={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Delete')}>
              <IconButton
                size='small'
                title={t('Delete Rule')}
                aria-label={t('Delete Rule')}
                color='error'
                onClick={() => {
                  handleDelete(row)
                  setDeleteDialogOpen(true)
                }}
                disabled={!ability.can('delete', 'rules')}
              >
                <Icon icon='mdi:delete-forever' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    }
  ]

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
                id: false
              }
            }
          }}
          autoHeight={true}
          apiRef={apiRef}
          getRowId={row => row.id}
          rows={filteredRows.length > 0 ? filteredRows : rows}
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
          pagination
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
          onRowSelectionModelChange={handleRowSelection}
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
              message: t('No Suppressions Found')
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
      </Card>

      {editDialogOpen && currentSuppression && (
        <UpdateSuppressionForm open={editDialogOpen} onClose={handleCloseEditDialog} suppression={currentSuppression} />
      )}
      <DeleteDialog />
    </Box>
  )
})

export default SuppressionsList
