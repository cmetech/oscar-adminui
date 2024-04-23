// ** React Imports
import { useState, useContext, useEffect, useCallback, forwardRef } from 'react'
import Link from 'next/link'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { useSession } from 'next-auth/react'
import themeConfig from 'src/configs/themeConfig'
import { styled, useTheme } from '@mui/material/styles'
import { atom, useAtom, useSetAtom } from 'jotai'
import { formatISO } from 'date-fns'

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

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { CustomDataGrid, TabList } from 'src/lib/styled-components.js'
import SLOEventHistoryDetailPanel from 'src/views/pages/slo/SLOEventHistoryDetailPanel'
import { refetchSloTriggerAtom } from 'src/lib/atoms'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

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

const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const SLOEventHistoryList = props => {
  // ** Hooks
  const ability = useContext(AbilityContext)
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
  const [sort, setSort] = useState('desc')

  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('timestamp')
  const [pinnedColumns, setPinnedColumns] = useState({})
  const [isFilterActive, setFilterActive] = useState(false)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchSloTriggerAtom)

  const getDetailPanelContent = useCallback(({ row }) => <SLOEventHistoryDetailPanel row={row} />, [])
  const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  // console.log('Session:', session)

  // column definitions
  const columns = [
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
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap>{row?.sliName?.toUpperCase()}</Typography>
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
                {row?.sliId}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      field: 'target_type',
      headerName: t('Budgeting Method'),
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
              <Typography noWrap>{row?.calculationMethod?.toUpperCase()}</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'target_value',
      headerName: t('Target Value (%)'),
      align: 'center',
      headerAlign: 'center',
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
              <Typography noWrap>{row?.targetValue}%</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'target_period',
      headerName: t('Target Rolling Period (days)'),
      align: 'center',
      headerAlign: 'center',
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
              <Typography noWrap>{row?.targetPeriod} days</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 100,
      field: 'value',
      headerName: t('Value'),
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
              <Typography noWrap>{row?.value}</Typography>
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
        if (row?.status?.toLowerCase() === 'success') {
          color = 'success'
          label = 'SUCCESS'
        } else {
          color = 'error'
          label = 'FAILURE'
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
                width: '100%' // Uses full width to align text to the start properly
              }}
            >
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
      flex: 0.02,
      minWidth: 60,
      field: 'createdAtTime',
      headerName: t('Created At'),
      renderCell: params => {
        const { row } = params

        // console.log('timestamp:', row?.timestamp)
        const timezone = session?.data?.user?.timezone || 'US/Eastern'

        const humanReadableDate = formatInTimeZone(
          utcToZonedTime(parseISO(row?.timestamp), timezone),
          timezone,
          'MMM d, h:mm aa zzz'
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
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography noWrap>{humanReadableDate}</Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  const fetchData = useCallback(
    async () => {
      let data = []

      // Default start and end times to the last 24 hours if not defined
      const [startDate, endDate] = props.dateRange || []

      // Assuming props.dateRange contains Date objects or is undefined
      const startTime =
        props.dateRange?.[0]?.toISOString() || new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString()
      const endTime = props.dateRange?.[1]?.toISOString() || new Date().toISOString()

      // console.log('Start Time:', startTime)
      // console.log('End Time:', endTime)
      // console.log('Search Value:', searchValue)
      // console.log('Sort:', sort)
      // console.log('Sort Column:', sortColumn)
      // console.log('Page:', paginationModel.page)
      // console.log('Page Size:', paginationModel.pageSize)

      setLoading(true)
      await axios
        .get('/api/sli/events', {
          params: {
            q: searchValue,
            sort: sort,
            column: sortColumn,
            skip: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            start_time: startTime,
            end_time: endTime
          },
          timeout: 30000
        })
        .then(res => {
          // console.log('total_pages', res.data.total_pages)
          // console.log('total_records', res.data.total_records)

          setRowCount(res.data.total_records || 0)
          setRows(res.data.rows || [])
        })

      // await loadServerRows(paginationModel.page, paginationModel.pageSize, data).then(slicedRows => setRows(slicedRows))
      setLoading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel.page, paginationModel.pageSize, sort, sortColumn, props.dateRange]
  )

  useEffect(() => {
    fetchData()
  }, [refetchTrigger, fetchData])

  const handleSortModel = newModel => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
      setSearchValue(searchValue)
      fetchData()
    } else {
      setSort('desc')
      setSortColumn('timestamp')
    }
  }

  const handleAction = event => {
    setAction(event.target.value)
  }

  const handleSearch = value => {
    setSearchValue(value)
    const searchRegex = new RegExp(escapeRegExp(value), 'i')

    const filteredRows = rows.filter(row => {
      return Object.keys(row).some(field => {
        // @ts-ignore
        return searchRegex.test(row[field].toString())
      })
    })
    if (value.length) {
      setFilteredRows(filteredRows)
    } else {
      setFilteredRows([])
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
            filter: {
              filterModel: {
                items: [],
                quickFilterExcludeHiddenColumns: false,
                quickFilterValues: ['ab']
              }
            },
            columns: {
              columnVisibilityModel: {
                createdAtTime: false,
                id: false
              }
            }
          }}
          autoHeight={true}
          pagination
          rows={filteredRows.length ? filteredRows : rows}
          rowCount={rowCountState}
          columns={columns}
          checkboxSelection={false}
          disableRowSelectionOnClick
          sortingMode='server'
          paginationMode='server'
          paginationModel={paginationModel}
          onSortModelChange={handleSortModel}
          pageSizeOptions={[5, 10, 25, 50]}
          onPageChange={newPage => setPaginationModel(oldModel => ({ ...oldModel, page: newPage }))}
          onPageSizeChange={newPageSize => setPaginationModel(oldModel => ({ ...oldModel, pageSize: newPageSize }))}
          onPaginationModelChange={setPaginationModel}
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
              message: 'No SLOs found'
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
    </Box>
  )
}

export default SLOEventHistoryList
