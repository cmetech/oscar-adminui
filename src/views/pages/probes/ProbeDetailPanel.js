import React, { useState } from 'react'
import { Tab, Box, Typography } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { CustomDataGrid } from 'src/lib/styled-components'
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

const CustomProbeToolbar = () => {
  return (
    <GridToolbarContainer
      sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', marginBottom: '10px' }}
    >
      <Box sx={{ '& > *:not(:last-child)': { marginRight: 2 } }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </Box>
      <Box>
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
      </Box>
    </GridToolbarContainer>
  )
}

const ProbeDetailPanel = ({ row }) => {
  const [value, setValue] = useState('1')

  const theme = useTheme()

  const [filterModel, setFilterModel] = useState({
    payload: { items: [] },
    headers: { items: [] },
    kwargs: { items: [] }
  })

  const { t } = useTranslation()

  const [paginationModel, setPaginationModel] = useState({
    payload: { page: 0, pageSize: 5 },
    headers: { page: 0, pageSize: 5 },
    kwargs: { page: 0, pageSize: 5 }
  })

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handlePaginationChange = (tab, model) => {
    setPaginationModel(prevModel => ({
      ...prevModel,
      [tab]: model
    }))
  }

  const handleFilterModelChange = (tab, model) => {
    setFilterModel(prevModel => ({
      ...prevModel,
      [tab]: model
    }))
  }

  const payloadData = row.metadata?.payload || ''

  const headers = row.kwargs?.__http_headers__ ? JSON.parse(row.kwargs.__http_headers__) : {}

  const headersRows = Object.entries(headers).map(([key, value], index) => ({
    id: index,
    key,
    value
  }))

  const kwargsRows = row.kwargs
    ? Object.entries(row.kwargs)
        .filter(([key]) => key !== '__http_headers__' && key !== '__endpoint__')
        .map(([key, value], index) => ({
          id: index,
          key,
          value
        }))
    : []

  const commonColumns = [
    { field: 'key', headerName: t('Key'), flex: 1, minWidth: 150 },
    { field: 'value', headerName: t('Value'), flex: 1, minWidth: 150 }
  ]

  return (
    <Box sx={{ m: 5 }}>
      {row.type === 'api' ? (
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label='Probe details tabs'>
              <Tab label={t('Payload')} value='1' />
              <Tab label={t('Headers')} value='2' />
              <Tab label={t('Kwargs')} value='3' />
            </TabList>
          </Box>
          <TabPanel value='1'>
            <Typography variant='h6' sx={{ marginBottom: 2 }}>
              Payload:
            </Typography>
            <Typography variant='body1'>
              {typeof payloadData === 'string' ? payloadData : JSON.stringify(payloadData, null, 2)}
            </Typography>
          </TabPanel>

          <TabPanel value='2'>
            <CustomDataGrid
              rows={headersRows}
              columns={commonColumns}
              pageSize={paginationModel.headers.pageSize}
              page={paginationModel.headers.page}
              onPageChange={newPage => handlePaginationChange('headers', { ...paginationModel.headers, page: newPage })}
              onPageSizeChange={newPageSize =>
                handlePaginationChange('headers', { ...paginationModel.headers, pageSize: newPageSize })
              }
              filterModel={filterModel.headers}
              onFilterModelChange={model => handleFilterModelChange('headers', model)}
              pagination
              rowsPerPageOptions={[5, 10, 25]}
              autoHeight
              slots={{
                toolbar: CustomProbeToolbar,
                noRowsOverlay: NoRowsOverlay,
                noResultsOverlay: NoResultsOverlay,
                loadingOverlay: CustomLoadingOverlay
              }}
              slotProps={{
                baseButton: {
                  variant: 'outlined'
                },
                noRowsOverlay: {
                  message: 'No Headers Found'
                },
                noResultsOverlay: {
                  message: 'No Results Found'
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
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused': {
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
                        backgroundColor: 'rgba(0, 0, 255, 0.04)',
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
                  logicOperators: [GridLogicOperator.And, GridLogicOperator.Or],
                  columnsSort: 'asc',
                  filterFormProps: {
                    logicOperatorInputProps: {
                      variant: 'outlined',
                      size: 'small'
                    },
                    columnInputProps: {
                      variant: 'outlined',
                      size: 'small',
                      sx: {
                        mt: 'auto',
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor:
                                theme.palette.mode == 'dark'
                                  ? theme.palette.customColors.brandYellow
                                  : theme.palette.primary.main
                            }
                          }
                        },
                        '& .MuiInputLabel-outlined': {
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
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor:
                                theme.palette.mode == 'dark'
                                  ? theme.palette.customColors.brandYellow
                                  : theme.palette.primary.main
                            }
                          }
                        },
                        '& .MuiInputLabel-outlined': {
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
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor:
                                  theme.palette.mode == 'dark'
                                    ? theme.palette.customColors.brandYellow
                                    : theme.palette.primary.main
                              }
                            }
                          },
                          '& .MuiInputLabel-outlined': {
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
                        backgroundColor: 'rgba(0, 0, 255, 0.04)',
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
              rows={kwargsRows}
              columns={commonColumns}
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
                toolbar: CustomProbeToolbar,
                noRowsOverlay: NoRowsOverlay,
                noResultsOverlay: NoResultsOverlay,
                loadingOverlay: CustomLoadingOverlay
              }}
              slotProps={{
                baseButton: {
                  variant: 'outlined'
                },
                noRowsOverlay: {
                  message: 'No Keyword Arguments Found'
                },
                noResultsOverlay: {
                  message: 'No Results Found'
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
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused': {
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
                        backgroundColor: 'rgba(0, 0, 255, 0.04)',
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
                  logicOperators: [GridLogicOperator.And, GridLogicOperator.Or],
                  columnsSort: 'asc',
                  filterFormProps: {
                    logicOperatorInputProps: {
                      variant: 'outlined',
                      size: 'small'
                    },
                    columnInputProps: {
                      variant: 'outlined',
                      size: 'small',
                      sx: {
                        mt: 'auto',
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor:
                                theme.palette.mode == 'dark'
                                  ? theme.palette.customColors.brandYellow
                                  : theme.palette.primary.main
                            }
                          }
                        },
                        '& .MuiInputLabel-outlined': {
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
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor:
                                theme.palette.mode == 'dark'
                                  ? theme.palette.customColors.brandYellow
                                  : theme.palette.primary.main
                            }
                          }
                        },
                        '& .MuiInputLabel-outlined': {
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
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor:
                                  theme.palette.mode == 'dark'
                                    ? theme.palette.customColors.brandYellow
                                    : theme.palette.primary.main
                              }
                            }
                          },
                          '& .MuiInputLabel-outlined': {
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
                        backgroundColor: 'rgba(0, 0, 255, 0.04)',
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
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography
            noWrap
            variant='body1'
            sx={{
              marginBottom: '.5rem',
              color:
                theme.palette.mode === 'light'
                  ? theme.palette.customColors.brandBlack
                  : theme.palette.customColors.brandYellow
            }}
          >
            No Additional Data
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ProbeDetailPanel
