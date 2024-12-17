// ** React Imports
import React, { useState, forwardRef } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import dayjs from 'src/lib/dayjs-config'

// ** MUI Imports
import {
  Box,
  Typography,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Fade,
  Tooltip
} from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import { styled, useTheme } from '@mui/material/styles'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Icon from 'src/@core/components/icon'

// ** DataGrid Imports
import { CustomDataGrid } from 'src/lib/styled-components'
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid-pro'

// ** Custom Components Imports
import { DataGridPro, GridLoadingOverlay, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

// ** Translation Hook
import { useTranslation } from 'react-i18next'

// ** Jotai Imports
import { useAtom } from 'jotai'
import { timezoneAtom } from 'src/lib/atoms'
import { useSession } from 'next-auth/react'
import { getTimezoneAbbreviation } from 'src/lib/utils'

// Styled Components
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
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))

const CustomToolbar = () => (
  <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
    <Box sx={{ '& > *:not(:last-child)': { marginRight: 2 } }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
    </Box>
    <GridToolbarQuickFilter
      sx={{
        '& .MuiInputBase-root': {
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '4px',
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.87)'
          },
          '&.Mui-focused': {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 2px rgba(25, 118, 210, 0.2)`
          }
        },
        '& .MuiInputBase-input': {
          padding: '8px 8px 8px 14px'
        },
        '& .MuiSvgIcon-root': {
          marginLeft: '8px'
        }
      }}
    />
  </GridToolbarContainer>
)

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const ActiveRulesDetailPanel = ({ row, onDataChange }) => {
  const [value, setValue] = useState('condition')
  const theme = useTheme()
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suppressionToDelete, setSuppressionToDelete] = useState(null)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  // Prepare data for 'Labels to Add' tab
  const labelsRows = row.actions?.add_labels
    ? Object.entries(row.actions.add_labels).map(([key, value], index) => ({ id: index, key, value }))
    : []

  // Columns for the labels grid
  const labelsColumns = [
    { field: 'key', headerName: t('Key'), flex: 1 },
    { field: 'value', headerName: t('Value'), flex: 1 }
  ]

  // Columns for the suppression windows grid (matching SuppressionsList style)
  const [timezone] = useAtom(timezoneAtom)
  const session = useSession()
  const userTimezone = timezone || 'UTC'

  const suppressionColumns = [
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
        const captionText = `timezone: ${userTzAbbr} (created in ${originalTzAbbr})`

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
      flex: 0.05,
      field: 'actions',
      headerName: t('Actions'),
      type: 'actions',
      sortable: false,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Tooltip title={t('Delete')}>
              <IconButton
                size='small'
                color='error'
                aria-label={t('Remove Suppression Window')}
                onClick={() => handleDeleteSuppression(row)}
                sx={{
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(211, 47, 47, 0.04)'
                  }
                }}
              >
                <Icon
                  icon='mdi:delete-forever'
                  color='error'
                  style={{
                    fontSize: '22px',
                    ...(theme.palette.mode === 'dark' && {
                      color: theme.palette.customColors.brandRed1 // Using a brighter red in dark mode
                    })
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    }
  ]

  // Add handler for delete button click
  const handleDeleteSuppression = suppression => {
    setSuppressionToDelete(suppression)
    setDeleteDialogOpen(true)
  }

  // Add handler for delete confirmation
  const handleConfirmDelete = async () => {
    if (!suppressionToDelete) {
      toast.error(t('No suppression window selected for deletion'))

      return
    }

    try {
      console.log('Attempting to delete suppression:', suppressionToDelete)
      const encodedId = encodeURIComponent(suppressionToDelete.id)
      const response = await axios.delete(`/api/suppressions/${encodedId}`)
      console.log('Delete response:', response)

      // Success handling
      toast.success(t('Successfully deleted suppression window'))

      // Close dialog and clear deletion target
      setDeleteDialogOpen(false)
      setSuppressionToDelete(null)

      console.log('Calling onDataChange callback')
      // Call the parent's refresh function
      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      console.error('Detailed error in deletion:', {
        error: error,
        response: error.response,
        status: error.response?.status,
        message: error.response?.data?.message
      })
      toast.error(t('Failed to delete suppression window'))
    }
  }

  // Add handler for delete cancellation
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setSuppressionToDelete(null)
  }

  // Add the DeleteDialog component
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
              {t('Confirm Removal')}
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
                <Typography variant='h6'>{t('Confirm you want to remove this suppression window?')}</Typography>
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
            {t('Remove')}
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

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='rule-detail-tabs'
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
        >
          <Tab value='condition' label={t('Condition')} />
          <Tab value='labels' label={t('Labels to Add')} />
          <Tab value='suppressions' label={t('Suppression Windows')} />
        </TabList>
        <TabPanel value='condition'>
          <Typography
            component='pre'
            sx={{
              p: 4,
              borderRadius: 1,
              backgroundColor: theme => theme.palette.action.hover,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {row.condition}
          </Typography>
        </TabPanel>
        <TabPanel value='labels'>
          <CustomDataGrid
            autoHeight
            rows={labelsRows}
            columns={labelsColumns}
            disableRowSelectionOnClick
            hideFooter
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              noRowsOverlay: {
                message: t('No Labels Found')
              },
              noResultsOverlay: {
                message: t('No Results Found')
              },
              toolbar: {
                showQuickFilter: true
              },
              columnsPanel: {
                sx: {
                  '& .MuiCheckbox-root': {
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main,
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
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main
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
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main
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
        <TabPanel value='suppressions'>
          <CustomDataGrid
            autoHeight
            rows={row.suppression_windows || []}
            columns={suppressionColumns}
            disableRowSelectionOnClick
            hideFooter
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              noRowsOverlay: {
                message: t('No Suppression Windows Found')
              },
              noResultsOverlay: {
                message: t('No Results Found')
              },
              toolbar: {
                showQuickFilter: true
              },
              columnsPanel: {
                sx: {
                  '& .MuiCheckbox-root': {
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main,
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
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main
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
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main
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
      </TabContext>
      <DeleteDialog />
    </Box>
  )
}

export default ActiveRulesDetailPanel
