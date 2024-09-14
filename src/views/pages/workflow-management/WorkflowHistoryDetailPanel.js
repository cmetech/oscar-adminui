import React, { useState, useEffect } from 'react'
import { Tab, Box, Typography } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { CustomDataGrid } from 'src/lib/styled-components'
import { useTranslation } from 'react-i18next'
import { styled, useTheme } from '@mui/material/styles'
import { parseISO, format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import axios from 'axios'

// import CustomChip from 'src/@core/components/mui/chip'
import CustomChip from 'src/views/components/mui/chip'
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import { DataGridPro, GridLoadingOverlay, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'

const TabList = styled(MuiTabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 40,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))

const WorkflowHistoryDetailPanel = ({ row }) => {
  const [value, setValue] = useState('1')
  const [taskInstances, setTaskInstances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { t } = useTranslation()
  const theme = useTheme()

  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [runRefresh, setRunRefresh] = useState(false)
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  useEffect(() => {
    const fetchTaskInstances = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(`/api/workflows/history/tasks`, {
          params: {
            workflow_id: row.dag_id,
            workflow_run_id: row.dag_run_id
          }
        })
        console.log('Task instances:', response.data.task_instances)
        setTaskInstances(response.data.task_instances || [])
      } catch (error) {
        console.error('Error fetching task instances:', error)
        setError('Failed to fetch task instances. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchTaskInstances()
  }, [row.dag_id, row.dag_run_id])

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    try {
      const date = parseISO(dateString)
      const zonedDate = utcToZonedTime(date, 'UTC')

      return format(zonedDate, 'yyyy-MM-dd HH:mm:ss zzz')
    } catch (error) {
      console.error('Error parsing date:', error)

      return 'Invalid Date'
    }
  }

  const safeUpperCase = value => {
    return typeof value === 'string' ? value.toUpperCase() : 'N/A'
  }

  const taskInstanceColumns = [
    {
      field: 'task_id',
      headerName: t('Task ID'),
      flex: 1,
      renderCell: params => (
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
            <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
              {safeUpperCase(params.row.task_id)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'task_display_name',
      headerName: t('Display Name'),
      flex: 1,
      renderCell: params => (
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
            <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
              {safeUpperCase(params.row.task_display_name)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'state',
      headerName: t('State'),
      flex: 0.7,
      renderCell: params => {
        const state = params.row.state || 'unknown'

        const color =
          state === 'success'
            ? 'success'
            : state === 'running'
            ? 'info'
            : state === 'failed'
            ? 'error'
            : state === 'skipped'
            ? 'warning'
            : 'default'

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
              <CustomChip
                rounded
                size='medium'
                skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                color={color}
                label={safeUpperCase(state)}
              />
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'start_date',
      headerName: t('Start Date'),
      flex: 1.2,
      renderCell: params => (
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
            <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
              {formatDate(params.row.start_date)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'end_date',
      headerName: t('End Date'),
      flex: 1.2,
      renderCell: params => (
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
            <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
              {formatDate(params.row.end_date)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'duration',
      headerName: t('Duration'),
      flex: 0.7,
      renderCell: params => (
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
            <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
              {params.row.duration != null ? `${params.row.duration.toFixed(2)} seconds` : 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'try_number',
      headerName: t('Try Number'),
      flex: 0.7,
      renderCell: params => (
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
            <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
              {params.row.try_number != null ? params.row.try_number : 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'operator',
      headerName: t('Operator'),
      flex: 1,
      renderCell: params => (
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
            <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
              {params.row.operator || 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    }
  ]

  // Hidden columns
  const hiddenFields = []

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  return (
    <Box sx={{ m: 2 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='Workflow history detail tabs'>
            <Tab label={t('Task Instances')} value='1' />
            <Tab label={t('Configuration')} value='2' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          <CustomDataGrid
            getRowId={row => row.task_id || Math.random().toString(36).substr(2, 9)}
            autoHeight
            rows={taskInstances}
            columns={taskInstanceColumns}
            loading={loading}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            slots={{
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              panel: {
                anchorEl: isFilterActive ? filterButtonEl : columnsButtonEl
              },
              noRowsOverlay: {
                message: 'No Records found'
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
        </TabPanel>
        <TabPanel value='2'>
          <Typography variant='body1'>Configuration:</Typography>
          <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(row.conf || {}, null, 2)}
          </Typography>
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default WorkflowHistoryDetailPanel
