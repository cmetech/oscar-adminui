import React, { useState, useContext, useEffect, useCallback } from 'react'
import { Box, Card, CardHeader, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { atom, useAtom, useSetAtom } from 'jotai'
import axios from 'axios'
import { CustomDataGrid } from 'src/lib/styled-components'
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import CustomChip from 'src/@core/components/mui/chip'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import WorkflowHistoryDetailPanel from 'src/views/pages/workflow-management/WorkflowHistoryDetailPanel'
import { set } from 'lodash'
import toast from 'react-hot-toast'
import { parseISO, formatDistance } from 'date-fns'
import { format, zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz'
import { escapeRegExp, getNestedValue } from 'src/lib/utils'
import { todayRounded, yesterdayRounded } from 'src/lib/calendar-timeranges'
import { DataGridPro, GridLoadingOverlay, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'
import { timezoneAtom } from 'src/lib/atoms'

const WorkflowHistory = props => {
  const { t } = useTranslation()
  const theme = useTheme()
  const session = useSession()

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [sortModel, setSortModel] = useState([{ field: 'execution_date', sort: 'desc' }])
  const [filterModel, setFilterModel] = useState({ items: [] })
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])

  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [runRefresh, setRunRefresh] = useState(false)
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [timezone] = useAtom(timezoneAtom)

  const columns = [
    {
      flex: 0.2,
      field: 'dag_id',
      headerName: t('Name'),
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
              {params.row?.dag_id?.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.2,
      field: 'note',
      headerName: t('Description'),
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
              {params.row.note}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.1,
      field: 'state',
      headerName: t('State'),
      renderCell: params => {
        const { row } = params
        let color = 'default'
        switch (row.state) {
          case 'success':
            color = 'success'
            break
          case 'running':
            color = 'info'
            break
          case 'failed':
            color = 'error'
            break
          default:
            color = 'default'
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <CustomChip
                rounded
                size='medium'
                skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                color={color}
                label={row.state.toUpperCase()}
              />
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'execution_date',
      headerName: t('Execution Date'),
      renderCell: params => {
        const date = parseISO(params.row.execution_date)

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
              <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {formatInTimeZone(utcToZonedTime(date, 'UTC'), timezone, 'yyyy-MM-dd HH:mm:ss zzz')}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'start_date',
      headerName: t('Start Date'),
      renderCell: params => {
        const date = parseISO(params.row.start_date)

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
              <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {formatInTimeZone(utcToZonedTime(date, 'UTC'), timezone, 'yyyy-MM-dd HH:mm:ss zzz')}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'end_date',
      headerName: t('End Date'),
      renderCell: params => {
        const date = params.row.end_date ? parseISO(params.row.end_date) : null

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
              <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {date ? formatInTimeZone(utcToZonedTime(date, 'UTC'), timezone, 'yyyy-MM-dd HH:mm:ss zzz') : 'N/A'}
              </Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  const fetchData = useCallback(
    async filterModel => {
      // Default start and end times to the last 24 hours if not defined
      let startDate, endDate

      if (props.onAccept === true) {
        startDate = yesterdayRounded
        endDate = todayRounded
      } else if (Array.isArray(props.onAccept) && props.onAccept.length === 2) {
        ;[startDate, endDate] = props.onAccept
      } else {
        startDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        endDate = new Date()
      }

      // Ensure startDate and endDate are Date objects
      startDate = startDate instanceof Date ? startDate : new Date(startDate)
      endDate = endDate instanceof Date ? endDate : new Date(endDate)

      console.log('onAccept:', props.onAccept)
      console.log('Start Date:', startDate)
      console.log('End Date:', endDate)

      const startTime = startDate.toISOString()
      const endTime = endDate.toISOString()

      // ... rest of the function remains the same

      setLoading(true)
      try {
        const response = await axios.post('/api/workflows/history', {
          dag_ids: [],
          states: [],
          order_by: sortModel[0]?.field || 'execution_date',
          page_offset: paginationModel.page * paginationModel.pageSize,
          page_limit: paginationModel.pageSize,
          execution_date_gte: startTime,
          execution_date_lte: endTime
        })

        if (response.status === 200) {
          setRows(response.data.dag_runs || [])
          setRowCount(response.data.total_entries || 0)
        } else {
          setRows([])
          setRowCount(0)
          toast.error(t('Error fetching workflow history'))
        }
      } catch (error) {
        console.error('Error fetching workflow history:', error)
        setRows([])
        setRowCount(0)
        toast.error(t('Error fetching workflow history'))
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel.page, paginationModel.pageSize, sortModel[0]?.field, sortModel[0]?.sort, props.onAccept]
  )
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSortModelChange = newModel => {
    setSortModel(newModel)
  }

  const handleFilterModelChange = newModel => {
    setFilterModel(newModel)
  }

  const getDetailPanelContent = useCallback(({ row }) => <WorkflowHistoryDetailPanel row={row} />, [])
  const getDetailPanelHeight = useCallback(() => 600, [])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  // Hidden columns
  const hiddenFields = []

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  return (
    <Box>
      <Card>
        <CardHeader title={t('Workflow History')} />
        <CustomDataGrid
          getRowId={row => `${row.dag_id}_${row.dag_run_id}`}
          autoHeight
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          filterMode='server'
          sortingMode='server'
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          getDetailPanelContent={getDetailPanelContent}
          getDetailPanelHeight={() => 400}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          onDetailPanelExpandedRowIdsChange={handleDetailPanelExpandedRowIdsChange}
          slots={{
            toolbar: ServerSideToolbar,
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
      </Card>
    </Box>
  )
}

export default WorkflowHistory
