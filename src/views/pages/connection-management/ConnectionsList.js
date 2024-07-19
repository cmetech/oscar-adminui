import { useState, useContext, useEffect, useCallback, useRef, useMemo, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { styled, useTheme } from '@mui/material/styles'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import { DataGridPro, GridLoadingOverlay, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import ServerSideToolbar from 'src/views/pages/misc/ServerSideToolbar'
import UpdateConnectionWizard from 'src/views/pages/connection-management/forms/UpdateConnectionWizard'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

// ** Third Party Components
import axios from 'axios'
import toast from 'react-hot-toast'

// ** Styled Components
import { CustomDataGrid } from 'src/lib/styled-components'
import { useAtom } from 'jotai'
import { connectionsIdsAtom, connectionsAtom, refetchConnectionsTriggerAtom } from 'src/lib/atoms'

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

const ConnectionsList = props => {
  // ** Hooks
  const { t } = useTranslation()
  const theme = useTheme()

  // ** Data Grid State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [rowCountState, setRowCountState] = useState(rowCount)
  const [sortModel, setSortModel] = useState([{ field: 'connection_id', sort: 'asc' }])

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
  const [connections, setConnections] = useAtom(connectionsAtom)
  const [connectionsIds, setConnectionsIds] = useAtom(connectionsIdsAtom)
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchConnectionsTriggerAtom)
  const [filterMode, setFilterMode] = useState('client')
  const [sortingMode, setSortingMode] = useState('server')
  const [paginationMode, setPaginationMode] = useState('server')

  // ** Dialog
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [testDialog, setTestDialog] = useState(false)
  const [currentConnection, setCurrentConnection] = useState(null)

  // column definitions
  const columns = [
    {
      flex: 0.07,
      field: 'connection_id',
      headerName: t('Connection ID'),
      renderCell: params => {
        const { row } = params

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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.connection_id?.toUpperCase()} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.connection_id?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.07,
      field: 'conn_type',
      headerName: t('Connection Type'),
      renderCell: params => {
        const { row } = params

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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.conn_type?.toUpperCase()} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.conn_type?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.06,
      field: 'host',
      headerName: t('Host'),
      renderCell: params => {
        const { row } = params

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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.host?.toUpperCase()} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.host?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.05,
      field: 'port',
      headerName: t('Port'),
      renderCell: params => {
        const { row } = params

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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.port} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.port}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'schema',
      headerName: t('Schema'),
      renderCell: params => {
        const { row } = params

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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textoverflow: 'ellipsis' }}>
              <Typography title={row?.schema?.toUpperCase()} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row?.schema?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'description',
      headerName: t('Description'),
      renderCell: params => {
        const { row } = params
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
      minWidth: 200,
      field: 'actions',
      headerName: t('Actions'),
      type: 'string',
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
                title='Test Connection'
                aria-label='Test Connection'
                color='info'
                onClick={() => {
                  setCurrentConnection(row)
                  setTestDialog(true)
                }}
              >
                <Icon icon='mdi:lan-check' />
              </IconButton>
              <IconButton
                size='small'
                title='Edit Connection'
                color='secondary'
                aria-label='Edit Connection'
                onClick={() => {
                  setCurrentConnection(row)
                  setEditDialog(true)
                }}
              >
                <Icon icon='mdi:account-edit' />
              </IconButton>
              <IconButton
                size='small'
                title='Delete Connection'
                aria-label='Delete Connection'
                color='error'
                onClick={() => {
                  setCurrentConnection(row)
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
  

  const fetchConnections = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/workflows/connections', {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          sort: sortModel[0]?.sort || 'asc',
          order_by: sortModel[0]?.field || 'conn_id'
        }
      })
      setRows(response.data.connections)
      props.set_total(response.data.total_entries)
    } catch (error) {
      console.error('Failed to fetch connections:', error)
      toast.error('Failed to fetch connections')
    } finally {
      setLoading(false)
    }
  }, [paginationModel.page, paginationModel.pageSize, sortModel, props])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  const handleEditDialogClose = () => {
    setEditDialog(false)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false)
  }

  const handleTestDialogClose = () => {
    setTestDialog(false)
  }

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/workflows/connections/${currentConnection.conn_id}`)
      toast.success('Connection deleted successfully')
      fetchConnections()
    } catch (error) {
      console.error('Failed to delete connection:', error)
      toast.error('Failed to delete connection')
    }
    setDeleteDialog(false)
  }

  const handleTestConfirm = async () => {
    try {
      const response = await axios.post(`/api/workflows/connections/${currentConnection.conn_id}/test`)
      toast.success('Connection test successful')
      // Handle the test response as needed
    } catch (error) {
      console.error('Connection test failed:', error)
      toast.error('Connection test failed')
    }
    setTestDialog(false)
  }

  const EditDialog = () => {
    return (
      <Dialog
        fullWidth
        maxWidth='lg'
        scroll='body'
        open={editDialog}
        onClose={handleEditDialogClose}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentConnection?.connection_id?.toUpperCase() ?? ''}
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
              {currentConnection?.conn_type?.toUpperCase() ?? ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton
            size='small'
            onClick={() => handleEditDialogClose()}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              Edit Connection Information
            </Typography>
            <Typography variant='body2'>Updates to connection information will be effective immediately.</Typography>
          </Box>
          {currentConnection && (
            <UpdateConnectionWizard
              connectionData={currentConnection}
              onSuccess={handleEditDialogClose}
            />
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
              {currentConnection?.connection_id?.toUpperCase() ?? ''}
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
              {currentConnection?.conn_type?.toUpperCase() ?? ''}
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
                  Please confirm that you want to delete this connection.
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
      const headers = {
        Accept: 'application/json'
      }

      // console.log('Deleting Task:', currentWorkflow)

      const endpoint = `/api/connections/${currentConnection.connection_id}`

      console.log('DELETE Endpoint:', endpoint)
      const response = await axios.delete(endpoint, { headers })

      if (response.status === 204) {
        const updatedRows = rows.filter(row => row.connection_id !== currentConnection.connection_id)

        setRows(updatedRows)
        setDeleteDialog(false)

        // props.set_total(props.total - 1)

        setRefetchTrigger(Date.now())

        toast.success('Successfully deleted Connection')
      }
    } catch (error) {
      console.error('Failed to delete Connection', error)
      toast.error('Failed to delete Connection')
    }
  }

  // Hidden columns
  const hiddenFields = []

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  return (
    <Box>
      <Card sx={{ position: 'relative' }}>
        <CardHeader title={t(props.type)} sx={{ textTransform: 'capitalize' }} />
        <CustomDataGrid
          getRowId={row => row.connection_id}
          localeText={{
            toolbarColumns: t('Columns'),
            toolbarFilters: t('Filters')
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                // Add any columns you want to hide by default
              }
            }
          }}
          autoHeight
          rows={filteredRows.length ? filteredRows : rows}
          rowCount={rowCountState}
          columns={columns}
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
          loading={loading}
          slotProps={{
            baseButton: {
              variant: 'outlined'
            },
            panel: {
              anchorEl: isFilterActive ? filterButtonEl : columnsButtonEl
            },
            noRowsOverlay: {
              message: 'No Workflows found'
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

        <EditDialog />
        <DeleteDialog />
      </Card>
    </Box>
  )
}

export default ConnectionsList