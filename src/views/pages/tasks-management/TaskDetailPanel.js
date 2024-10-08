import React, { useState } from 'react'
import { Tab, Box, Typography } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { CustomDataGrid } from 'src/lib/styled-components' // Assuming this is a custom component
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter
} from '@mui/x-data-grid-pro'
import { useTranslation } from 'react-i18next'
import { parseISO, format } from 'date-fns'

import { styled, useTheme } from '@mui/material/styles'
import { DataGridPro, GridLoadingOverlay, useGridApiRef, GridLogicOperator } from '@mui/x-data-grid-pro'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

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

const CustomTaskToolbar = () => {
  return (
    <GridToolbarContainer
      sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', marginBottom: '10px' }}
    >
      <Box sx={{ '& > *:not(:last-child)': { marginRight: 2 } }}>
        {/* Applying right margin to all child components except the last one */}
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {/* Additional buttons can be placed here if needed */}
      </Box>
      <Box>
        {/* Right-aligned toolbar items */}
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
              padding: '8px 8px 8px 14px' // Increase left padding
            },
            '& .MuiSvgIcon-root': {
              // Optionally target the search icon directly for finer control
              marginLeft: '8px' // Add space to the left of the search icon
            }
          }}
        />
      </Box>
    </GridToolbarContainer>
  )
}

const TaskDetailPanel = ({ row }) => {
  const [value, setValue] = useState('1')

  const theme = useTheme()

  const [filterModel, setFilterModel] = useState({
    args: { items: [] },
    kwargs: { items: [] },
    metadata: { items: [] },
    hosts: { items: [] },
    prompts: { items: [] }
  })

  const { t } = useTranslation()

  // Define pagination state for each tab separately
  const [paginationModel, setPaginationModel] = useState({
    args: { page: 0, pageSize: 5 },
    kwargs: { page: 0, pageSize: 5 },
    metadata: { page: 0, pageSize: 5 },
    hosts: { page: 0, pageSize: 5 },
    prompts: { page: 0, pageSize: 5 }
  })

  // console.log('row', row)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handlePaginationChange = (tab, model) => {
    setPaginationModel(prevModel => ({
      ...prevModel,
      [tab]: model
    }))
  }

  // Function to handle filter model change (if your DataGrid supports filtering)
  const handleFilterModelChange = (tab, model) => {
    setFilterModel(prevModel => ({
      ...prevModel,
      [tab]: model
    }))
  }

  // Convert schedule object to an array of key-value pairs for easy rendering
  const scheduleDetails = row.schedule ? Object.entries(row.schedule).map(([key, value]) => ({ key, value })) : null

  // Preparing args for display
  const argsRows = row.args.map((arg, index) => ({
    id: index,
    argument: arg
  }))

  // Preparing kwargs for display
  const kwargsRows = Object.entries(row.kwargs).map(([key, value], index) => ({
    id: index,
    key,
    value
  }))

  // Preparing metadata for display
  const metadataRows = Object.entries(row.metadata).map(([key, value], index) => ({
    id: index,
    key,
    value
  }))

  // Preparing hosts for display
  const hostsRows = row.hosts.map((host, index) => ({
    id: index,
    host
  }))

  // Preparing prompts for display
  const promptsRows = row.prompts.map((prompt, index) => ({
    id: index,
    prompt: prompt.prompt, // Assuming 'prompt' is the field name in your data
    default_value: prompt.default_value
  }))

  // Common column definitions for args, kwargs, metadata, and hosts
  const commonColumns = [
    { field: 'key', headerName: t('Key'), flex: 1, minWidth: 150 },
    { field: 'value', headerName: t('Value'), flex: 1, minWidth: 150 }
  ]

  // Since args and hosts might not have key-value pairs, you can define a single column to display their values
  const singleValueColumn = [
    { field: 'argument', headerName: t('Argument'), flex: 1, minWidth: 150 }

    // For hosts, you can reuse this column definition but map the field accordingly
  ]

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label={t('Task details tabs')}>
            <Tab label={t('Args')} value='1' />
            <Tab label={t('Kwargs')} value='2' />
            <Tab label={t('Metadata')} value='3' />
            <Tab label={t('Hosts')} value='4' />
            {row.schedule && <Tab label={t('Schedule')} value='schedule' />} {/* Conditionally add "Schedule" tab */}
            {row.prompts && <Tab label={t('Prompts')} value='prompts' />} {/* Conditionally add "Prompts" tab */}
          </TabList>
        </Box>
        <TabPanel value='1'>
          <CustomDataGrid
            rows={argsRows}
            columns={singleValueColumn.map(col => ({ ...col, field: 'argument' }))}
            pageSize={paginationModel.args.pageSize}
            page={paginationModel.args.page}
            onPageChange={newPage => handlePaginationChange('args', { ...paginationModel.args, page: newPage })}
            onPageSizeChange={newPageSize =>
              handlePaginationChange('args', { ...paginationModel.args, pageSize: newPageSize })
            }
            filterModel={filterModel.args}
            onFilterModelChange={model => handleFilterModelChange('args', model)}
            pagination
            rowsPerPageOptions={[5, 10, 25]}
            autoHeight
            slots={{
              toolbar: CustomTaskToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              noRowsOverlay: {
                message: t('No Arguments Found')
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
        <TabPanel value='2'>
          <CustomDataGrid
            rows={kwargsRows}
            columns={commonColumns.map(col => ({ ...col, field: col.field === 'key' ? 'key' : 'value' }))}
            pageSize={paginationModel.kwargs.pageSize}
            page={paginationModel.kwargs.page}
            onPageChange={newPage => handlePaginationChange('kwargs', { ...paginationModel.kwargs, page: newPage })}
            onPageSizeChange={newPageSize =>
              handlePaginationChange('kwargs', { ...paginationModel.kwargs, pageSize: newPageSize })
            }
            filterModel={filterModel.kwargs}
            onFilterModelChange={model => handleFilterModelChange('kwargs', model)}
            pagination
            rowsPerPageOptions={[5, 10, 25]}
            autoHeight
            slots={{
              toolbar: CustomTaskToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              noRowsOverlay: {
                message: t('No Keyword Arguments Found')
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
        <TabPanel value='3'>
          <CustomDataGrid
            rows={metadataRows}
            columns={commonColumns}
            pageSize={paginationModel.metadata.pageSize}
            page={paginationModel.metadata.page}
            onPageChange={newPage => handlePaginationChange('metadata', { ...paginationModel.metadata, page: newPage })}
            onPageSizeChange={newPageSize =>
              handlePaginationChange('metadata', { ...paginationModel.metadata, pageSize: newPageSize })
            }
            filterModel={filterModel.metadata}
            onFilterModelChange={model => handleFilterModelChange('metadata', model)}
            pagination
            rowsPerPageOptions={[5, 10, 25]}
            autoHeight
            slots={{
              toolbar: CustomTaskToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              noRowsOverlay: {
                message: t('No Metadata Found')
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
        <TabPanel value='4'>
          <CustomDataGrid
            rows={hostsRows}
            columns={singleValueColumn.map(col => ({ ...col, field: 'host' }))}
            pageSize={paginationModel.hosts.pageSize}
            page={paginationModel.hosts.page}
            onPageChange={newPage => handlePaginationChange('hosts', { ...paginationModel.hosts, page: newPage })}
            onPageSizeChange={newPageSize =>
              handlePaginationChange('hosts', { ...paginationModel.hosts, pageSize: newPageSize })
            }
            filterModel={filterModel.hosts}
            onFilterModelChange={model => handleFilterModelChange('hosts', model)}
            pagination
            rowsPerPageOptions={[5, 10, 25]}
            autoHeight
            slots={{
              toolbar: CustomTaskToolbar,
              noRowsOverlay: NoRowsOverlay,
              noResultsOverlay: NoResultsOverlay,
              loadingOverlay: CustomLoadingOverlay
            }}
            slotProps={{
              baseButton: {
                variant: 'outlined'
              },
              noRowsOverlay: {
                message: t('No Host Information Found')
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
        {row.schedule && (
          <TabPanel value='schedule'>
            <Typography variant='h6' sx={{ marginBottom: 2 }}>
              {t('Schedule Details:')}
            </Typography>
            {scheduleDetails.map(({ key, value }) => (
              <Typography key={key} variant='body1'>{`${key}: ${value}`}</Typography>
            ))}
          </TabPanel>
        )}
        {row.prompts && (
          <TabPanel value='prompts'>
            <CustomDataGrid
              rows={promptsRows}
              columns={[
                { field: 'prompt', headerName: t('Prompt'), flex: 1, minWidth: 150 },
                { field: 'default_value', headerName: t('Default Value'), flex: 1, minWidth: 150 }
              ]}
              pageSize={paginationModel.prompts.pageSize}
              page={paginationModel.prompts.page}
              onPageChange={newPage => handlePaginationChange('prompts', { ...paginationModel.prompts, page: newPage })}
              onPageSizeChange={newPageSize =>
                handlePaginationChange('prompts', { ...paginationModel.prompts, pageSize: newPageSize })
              }
              filterModel={filterModel.prompts}
              onFilterModelChange={model => handleFilterModelChange('prompts', model)}
              rowsPerPageOptions={[5, 10, 25]}
              autoHeight
              slots={{
                toolbar: CustomTaskToolbar,
                noRowsOverlay: NoRowsOverlay,
                noResultsOverlay: NoResultsOverlay,
                loadingOverlay: CustomLoadingOverlay
              }}
              slotProps={{
                baseButton: {
                  variant: 'outlined'
                },
                noRowsOverlay: {
                  message: t('No Records Found')
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
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandWhite
                          : theme.palette.primary.main,
                      color:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandWhite
                          : theme.palette.primary.main,
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
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandWhite
                          : theme.palette.primary.main,
                      color:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandWhite
                          : theme.palette.primary.main,
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
        )}
      </TabContext>
    </Box>
  )
}

export default TaskDetailPanel
