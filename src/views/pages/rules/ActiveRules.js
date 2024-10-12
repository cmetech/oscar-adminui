// src/views/pages/rules/ActiveRules.js
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardHeader,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Fade
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGridPro, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'
import Icon from 'src/@core/components/icon'
import axios from 'axios'
import { atom, useAtom, useSetAtom } from 'jotai'
import { toast } from 'react-hot-toast'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import UpdateRuleForm from 'src/views/pages/rules/forms/UpdateRuleForm'
import CustomChip from 'src/@core/components/mui/chip'
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import { CustomDataGrid, TabList } from 'src/lib/styled-components.js'
import { escapeRegExp, getNestedValue } from 'src/lib/utils'
import { rulesIdsAtom, rulesAtom, refetchRulesTriggerAtom } from 'src/lib/atoms'
import ActiveRulesDetailPanel from 'src/views/pages/rules/ActiveRulesDetailPanel' // Adjust the path as needed

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const ActiveRules = forwardRef((props, ref) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const ability = useContext(AbilityContext)
  const apiRef = useGridApiRef()

  // ** Data Grid State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }])
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [filterMode, setFilterMode] = useState('client')
  const [sortingMode, setSortingMode] = useState('client')
  const [paginationMode, setPaginationMode] = useState('client')
  const [filteredRows, setFilteredRows] = useState([])
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [rowSelectionModel, setRowSelectionModel] = useState([])
  const [rowCountState, setRowCountState] = useState(0)

  // ** State
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentRule, setCurrentRule] = useState(null)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState(null)
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [runRefresh, setRunRefresh] = useState(false)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchRulesTriggerAtom)
  const [rules, setRules] = useAtom(rulesAtom)
  const [rulesIds, setRulesIds] = useAtom(rulesIdsAtom)

  // Add state for detail panel
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState([])

  const handleDetailPanelExpandedRowIdsChange = useCallback(newIds => {
    setDetailPanelExpandedRowIds(newIds)
  }, [])

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchRules()
    }
  }))

  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/rules')
      console.log('Fetch Rules Response:', response.data)

      setRows(response.data.rules || [])

      // Set the total rule count
      if (props.setRuleTotal) {
        props.setRuleTotal(response.data.rules.length)
      }

      setRules(response.data.rules || [])
    } catch (error) {
      console.error('Failed to fetch rules', error)
      toast.error(t('Failed to fetch rules'))
    } finally {
      setLoading(false)
      setRunRefresh(false)
      setRunFilterQuery(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Use an effect to synchronize the DataGrid's selection model with probeIds
  useEffect(() => {
    // This updates the DataGrid's selection model whenever probeIds changes
    setRowSelectionModel(rulesIds)
  }, [rulesIds])

  useEffect(() => {
    setRowCountState(prevRowCountState => (rowCount !== undefined ? rowCount : prevRowCountState))
  }, [rowCount, setRowCountState])

  // Effect to fetch data initially and start the periodic refresh
  useEffect(() => {
    if (!runFilterQuery) {
      fetchRules()
    }

    const intervalId = setInterval(fetchRules, 300000) // Fetch data every 300 seconds (5 minutes)

    return () => clearInterval(intervalId) // Cleanup interval on component unmount
  }, [fetchRules, refetchTrigger, runFilterQuery])

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
        fetchData(filterModel)
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

  useEffect(() => {
    fetchRules()
  }, [fetchRules, refetchTrigger])

  useEffect(() => {
    if (runRefresh) {
      fetchRules()
    }

    // Reset the runRefresh flag
    return () => {
      runRefresh && setRunRefresh(false)
    }
  }, [fetchRules, runRefresh])

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
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('Confirm Deletion')}
            </Typography>
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
                <Typography variant='h6'>{t('Confirm you want to delete this rule?')}</Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='large'
            onClick={handleConfirmDelete}
            color='error'
            autoFocus
            startIcon={<Icon icon='mdi:delete-forever' />}
          >
            {t('Delete')}
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleCancelDelete}
            color='secondary'
            startIcon={<Icon icon='mdi:close' />}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const handleEdit = rule => {
    setCurrentRule(rule)
    setEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setCurrentRule(null)
    fetchRules()
  }

  const handleDelete = rule => {
    setRuleToDelete(rule)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (ruleToDelete) {
      try {
        await axios.delete(`/api/rules/${ruleToDelete.id}`)
        fetchRules()
        toast.success(t('Rule deleted successfully'))
      } catch (error) {
        console.error('Failed to delete rule', error)
        toast.error(t('Failed to delete rule'))
      } finally {
        setDeleteDialogOpen(false)
        setRuleToDelete(null)
      }
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setRuleToDelete(null)
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
      props.setRuleTotal(filteredRows.length)
    } else {
      setFilteredRows([])
      setRowCount(rows.length)
      props.setRuleTotal(rows.length)
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
    setRulesIds(newRowSelectionModel)
  }

  // Hidden columns
  const hiddenFields = ['id']

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  const columns = [
    {
      flex: 0.01,
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
                namespace: {row?.namespace}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.04,
      field: 'description',
      headerName: t('Description'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <Typography title={row?.description} noWrap>
              {row?.description}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.015,
      field: 'suppression',
      headerName: t('Suppression'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        const isSuppressed = row.actions?.suppress === true
        const label = isSuppressed ? t('Enabled') : t('Disabled')
        const color = isSuppressed ? 'success' : 'error'

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
      flex: 0.01,
      field: 'actions',
      headerName: t('Actions'),
      type: 'actions',
      sortable: false,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            {ability.can('update', 'rules') && (
              <Tooltip title={t('Edit')}>
                <IconButton onClick={() => handleEdit(row)} size='small'>
                  <Icon icon='mdi:edit' fontSize={20} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              size='small'
              title={t('Delete Probe')}
              aria-label={t('Delete Probe')}
              color='error'
              onClick={() => {
                handleDelete(row)
                setDeleteDialog(true)
              }}
              disabled={!ability.can('delete', 'rules')}
            >
              <Icon icon='mdi:delete-forever' />
            </IconButton>
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
          rows={filteredRows.length > 0 ? filteredRows : rows}
          rowCount={rowCountState}
          getRowId={row => `${row.namespace}-${row.name.replace(/\s+/g, '_')}`}
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
          onRowSelectionModelChange={newRowSelectionModel => setRowSelectionModel(newRowSelectionModel)}
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
          getDetailPanelContent={({ row }) => <ActiveRulesDetailPanel row={row} />}
          getDetailPanelHeight={() => 400}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          onDetailPanelExpandedRowIdsChange={handleDetailPanelExpandedRowIdsChange}
          components={
            {
              // ... other components ...
            }
          }
        />
      </Card>

      {editDialogOpen && currentRule && (
        <UpdateRuleForm open={editDialogOpen} onClose={handleCloseEditDialog} rule={currentRule} />
      )}
      <DeleteDialog />
    </Box>
  )
})

export default ActiveRules
