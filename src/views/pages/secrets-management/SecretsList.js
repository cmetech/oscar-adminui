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
import UpdateSecretsWizard from 'src/views/pages/secrets-management/forms/UpdateSecretsWizard'
import { refetchSecretsTriggerAtom, timezoneAtom } from 'src/lib/atoms'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import { secretsIdsAtom } from 'src/lib/atoms'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const SecretsList = ({ set_total, total, ...props }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  // ** Data Grid State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSecretIds, setSelectedSecretIds] = useAtom(secretsIdsAtom)
  const [rowCount, setRowCount] = useState(0)
  const [rowCountState, setRowCountState] = useState(rowCount)
  const [sortModel, setSortModel] = useState([{ field: 'path', sort: 'asc' }])

  // ** State
  const [searchValue, setSearchValue] = useState('')
  const [isFilterActive, setFilterActive] = useState(false)
  const [runFilterQuery, setRunFilterQuery] = useState(false)
  const [runRefresh, setRunRefresh] = useState(false)
  const [runFilterQueryCount, setRunFilterQueryCount] = useState(0)
  const [filterButtonEl, setFilterButtonEl] = useState(null)
  const [columnsButtonEl, setColumnsButtonEl] = useState(null)
  const [filterModel, setFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [appliedFilterModel, setAppliedFilterModel] = useState({ items: [], logicOperator: GridLogicOperator.Or })
  const [refetchTrigger, setRefetchTrigger] = useAtom(refetchSecretsTriggerAtom)
  const [filterMode, setFilterMode] = useState('client')
  const [sortingMode, setSortingMode] = useState('client')
  const [paginationMode, setPaginationMode] = useState('client')

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [secretToDelete, setSecretToDelete] = useState(null)
  const [secretToEdit, setSecretToEdit] = useState(null)
  const [visibleSecrets, setVisibleSecrets] = useState({})

  const [timezone] = useAtom(timezoneAtom)

  // ** Column Definitions
  const columns = [
    {
      flex: 0.2,
      field: 'path',
      headerName: t('Path'),
      resizable: true,
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
              <Typography title={row.path} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row.path}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      field: 'key',
      headerName: t('Key'),
      resizable: true,
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
              <Typography title={row.key} noWrap overflow={'hidden'} textoverflow={'ellipsis'}>
                {row.key}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.4,
      field: 'value',
      headerName: t('Value'),
      resizable: true,
      renderCell: params => {
        const { row } = params
        const isVisible = visibleSecrets[row.id]

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%'
            }}
          >
            <Typography
              title={isVisible ? row.value : t('Click the eye icon to reveal')}
              noWrap
              overflow={'hidden'}
              textOverflow={'ellipsis'}
              sx={{ flexGrow: 1, mr: 2 }}
            >
              {isVisible ? row.value : '*'.repeat(8)}
            </Typography>
            <IconButton size='small' onClick={() => toggleSecretVisibility(row.id)} sx={{ flexShrink: 0 }}>
              <Icon icon={isVisible ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} />
            </IconButton>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'actions',
      headerName: t('Actions'),
      type: 'string',
      resizable: true,
      renderCell: ({ row }) => (
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
              title={t('Edit Secret')}
              aria-label={t('Edit Secret')}
              onClick={() => handleEditClick(row)}
            >
              <Icon icon='mdi:edit' />
            </IconButton>
            <IconButton
              size='small'
              title={t('Delete Secret')}
              aria-label={t('Delete Secret')}
              color='error'
              onClick={() => handleDeleteClick(row)}
            >
              <Icon icon='mdi:delete-forever' />
            </IconButton>
          </Box>
        </Box>
      )
    }
  ]

  const [allRows, setAllRows] = useState([])

  const fetchSecrets = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/secrets')

      const formattedRows = response.data.keys.flatMap(secret => {
        const [fullPath, value] = Object.entries(secret)[0]

        const lastColonIndex = fullPath.lastIndexOf(':')

        const path = fullPath.substring(0, lastColonIndex)

        const key = fullPath.substring(lastColonIndex + 1)

        return {
          id: `${path}-${key}`,
          path,
          key,
          value
        }
      })
      setAllRows(formattedRows)
      setFilteredRows(formattedRows)
      setRowCount(formattedRows.length)
      set_total(formattedRows.length)
    } catch (error) {
      console.error('Failed to fetch secrets:', error)
      toast.error(t('Failed to fetch secrets'))
    } finally {
      setLoading(false)
    }
  }, [set_total, t])

  useEffect(() => {
    fetchSecrets()
    const intervalId = setInterval(fetchSecrets, 300000)

    return () => clearInterval(intervalId)
  }, [fetchSecrets, refetchTrigger])

  const applyFiltersAndSort = useCallback(() => {
    let result = [...allRows]

    // Apply filtering
    if (appliedFilterModel.items.length > 0) {
      result = result.filter(row => {
        return appliedFilterModel.items.every(filter => {
          const value = row[filter.field]
          if (value === undefined || value === null) {
            return false // or true, depending on how you want to handle null/undefined values
          }
          switch (filter.operator) {
            case 'contains':
              return value.toString().toLowerCase().includes(filter.value.toLowerCase())
            case 'equals':
              return value.toString().toLowerCase() === filter.value.toLowerCase()
            case 'startsWith':
              return value.toString().toLowerCase().startsWith(filter.value.toLowerCase())
            case 'endsWith':
              return value.toString().toLowerCase().endsWith(filter.value.toLowerCase())
            default:
              return true
          }
        })
      })
    }

    // Apply search
    if (searchValue) {
      const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
      result = result.filter(row => {
        return ['path', 'key', 'value'].some(field => searchRegex.test(row[field]))
      })
    }

    // Apply sorting
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0]
      result.sort((a, b) => {
        if (a[field] < b[field]) return sort === 'asc' ? -1 : 1
        if (a[field] > b[field]) return sort === 'asc' ? 1 : -1

        return 0
      })
    }

    setFilteredRows(result)
    setRowCount(result.length)
    set_total(result.length)
  }, [allRows, appliedFilterModel, searchValue, sortModel, set_total])

  useEffect(() => {
    applyFiltersAndSort()
  }, [applyFiltersAndSort])

  const handleSearch = value => {
    setSearchValue(value)
    applyFiltersAndSort()
  }

  const handleRowSelection = useCallback(
    newSelectionModel => {
      console.log('New Selection Model:', newSelectionModel)
      setSelectedSecretIds(newSelectionModel)
    },
    [setSelectedSecretIds]
  )

  const handleDeleteClick = secret => {
    setSecretToDelete(secret)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!secretToDelete) return

    try {
      const response = await axios.delete('/api/secrets/delete', {
        params: {
          path: secretToDelete.path,
          key: secretToDelete.key,
          delete_empty_paths: true
        }
      })

      if (response.status === 200) {
        toast.success(t('Secret deleted successfully'))
        setRefetchTrigger(Date.now())
      } else {
        toast.error(t('Failed to delete secret'))
      }
    } catch (error) {
      console.error('Error deleting secret:', error)
      toast.error(t('An error occurred while deleting the secret'))
    } finally {
      setDeleteDialogOpen(false)
      setSecretToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSecretToDelete(null)
  }

  const handleEditClick = secret => {
    setSecretToEdit(secret)
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
    setSecretToEdit(null)
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setSecretToEdit(null)
    setRefetchTrigger(Date.now())
  }

  const handleSearchChange = event => {
    setSearchValue(event.target.value)
  }

  const toggleSecretVisibility = useCallback(id => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }, [])

  // Hidden columns
  const hiddenFields = []

  const getTogglableColumns = columns => {
    setFilterActive(false)

    return columns.filter(column => !hiddenFields.includes(column.field)).map(column => column.field)
  }

  useEffect(() => {
    if (runRefresh) {
      fetchSecrets()
    }

    return () => {
      runRefresh && setRunRefresh(false)
    }
  }, [fetchSecrets, runRefresh])

  return (
    <Box>
      <Card sx={{ position: 'relative' }}>
        <CardHeader title={t(props.type)} sx={{ textTransform: 'capitalize' }} />
        <CustomDataGrid
          autoHeight
          rows={filteredRows}
          rowCount={rowCount}
          columns={columns}
          loading={loading}
          checkboxSelection={true}
          filterMode='client'
          filterModel={filterModel}
          onFilterModelChange={newFilterModel => {
            setFilterModel(newFilterModel)
          }}
          sortingMode='client'
          sortModel={sortModel}
          onSortModelChange={newSortModel => {
            setSortModel(newSortModel)
            applyFiltersAndSort()
          }}
          pagination={true}
          paginationMode='client'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          onRowSelectionModelChange={handleRowSelection}
          rowSelectionModel={selectedSecretIds}
          keepNonExistentRowsSelected
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
              message: 'No Secrets found'
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
              showexport: true,
              showRefresh: true,
              setRunRefresh: setRunRefresh,
              setRunFilterQuery: () => {
                setAppliedFilterModel(filterModel)
                applyFiltersAndSort()
              }
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
          disableColumnResize={false}
        />
        <Dialog fullWidth maxWidth='md' scroll='body' open={editDialogOpen} onClose={handleEditClose}>
          <UpdateSecretsWizard secretData={secretToEdit} onSuccess={handleEditSuccess} onClose={handleEditClose} />
        </Dialog>
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          TransitionComponent={Transition}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {t('Confirm Deletion')}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <IconButton
              size='small'
              onClick={() => handleDeleteCancel()}
              sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
            >
              <Icon icon='mdi:close' />
            </IconButton>
            <Box sx={{ mb: 8, textAlign: 'center' }}>
              <Stack direction='row' spacing={2} justifyContent='center' alignContent='center'>
                <Box>
                  <img src='/images/warning.png' alt='warning' width='32' height='32' />
                </Box>
                <Box>
                  <Typography variant='h5' justifyContent='center' alignContent='center'>
                    {t('Are you sure you want to delete this secret?')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant='contained'
              size='large'
              sx={{ mr: 1 }}
              onClick={handleDeleteConfirm}
              color='error'
              autoFocus
              startIcon={<Icon icon='mdi:delete-forever' />}
            >
              {t('Delete')}
            </Button>
            <Button
              variant='outlined'
              size='large'
              onClick={handleDeleteCancel}
              color='secondary'
              startIcon={<Icon icon='mdi:close' />}
            >
              {t('Cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  )
}

export default SecretsList
