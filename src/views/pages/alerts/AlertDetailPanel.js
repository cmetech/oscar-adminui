import React, { useState, useMemo } from 'react'
import { Tab, Box } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { CustomDataGrid } from 'src/lib/styled-components' // Assuming this is a custom component
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter,
  GridLogicOperator,
  useGridApiRef
} from '@mui/x-data-grid-pro'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'
import { parseISO, format } from 'date-fns'
import Link from 'next/link'
import Tooltip from '@mui/material/Tooltip'
import themeConfig from 'src/configs/themeConfig'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'
import CustomLoadingOverlay from 'src/views/components/CustomLoadingOverlay'
import { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'

// ** Styled Components
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

const AlertDetailPanel = ({ alert }) => {
  const [value, setValue] = useState('1')
  const [filterModel, setFilterModel] = useState({ items: [] })
  const { t } = useTranslation()
  const theme = useTheme()

  const groupDetailsColumns = [
    {
      flex: 0.035,
      field: 'group_key',
      headerName: t('GroupKey'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column' , overflow: 'hidden', textOverflow: 'ellipsis'}}>
              <Typography title={String(row?.group_key)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {String(row?.group_key).toUpperCase()}
              </Typography>
              <Typography
                title={String(row?.group_id)}
                noWrap
                variant='caption'
                overflow={'hidden'} 
                textOverflow={'ellipsis'}
                sx={{
                  fontSize: '0.65rem',
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.customColors.brandBlack
                      : theme.palette.customColors.brandYellow
                }}
              >
                {row?.group_id}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      field: 'group_status',
      headerName: t('Group Status'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        let color = 'error'
        let label = 'UNKN'
        if (row?.group_status?.toLowerCase() === 'firing') {
          color = 'error'
          label = 'ACTIVE'
        } else if (row?.group_status?.toLowerCase() === 'pending') {
          color = 'warning'
          label = 'PENDING'
        } else if (row?.group_status?.toLowerCase() === 'resolved') {
          color = 'success'
          label = 'RESOLVED'
        } else {
          color = 'info'
          label = 'INACTIVE'
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
                skin={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                label={label || 'UNKN'}
                color={color}
                sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
              />
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.035,
      field: 'external_url',
      headerName: t('External URL'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column' , overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography title={String(row?.external_url)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                  {String(row?.external_url).toUpperCase()}
                </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.035,
      field: 'generator_url',
      headerName: t('Generator URL'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column' , overflow: 'hidden', textOverflow: 'ellipsis'}}>
              <Typography title={String(row?.generator_url)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {String(row?.generator_url).toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.035,
      field: 'fingerprint',
      headerName: t('Alert Fingerprint'),
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
            <Box sx={{ display: 'flex', flexDirection: 'column' , overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography title={String(row?.fingerprint)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                  {String(row?.fingerprint).toUpperCase()}
                </Typography> 
                <Typography
                  title={String(row?.alert_id)}
                  noWrap
                  variant='caption'
                  overflow={'hidden'} 
                  textOverflow={'ellipsis'}
                  sx={{
                    fontSize: '0.65rem',
                    color:
                      theme.palette.mode === 'light'
                        ? theme.palette.customColors.brandBlack
                        : theme.palette.customColors.brandYellow
                  }}
                >
                  {row?.alert_id}
                </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      field: 'modified_at',
      headerName: t('Modified At'),
      renderCell: params => {
        const { row } = params

        let date = ''
        let humanReadableDate = ''

        if (row.modified_at) {
          humanReadableDate = formatInTimeZone(
            utcToZonedTime(parseISO(row?.modified_at), 'US/Eastern'),
            'US/Eastern',
            'MMM d, yyyy, h:mm:ss aa zzz'
          )
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {humanReadableDate}
              </Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  const groupDetailsRows = [
    {
      id: 1,
      group_id: alert.group_id,
      group_key: alert.group_key,
      group_status: alert.group_status,
      external_url: alert.external_url,
      generator_url: alert.generator_url,
      modified_at: alert.modified_at,
      fingerprint: alert.fingerPrint,
      alert_id: alert.alert_id
    }
  ]

  const groupLabelRows = alert.group_labels || []
  const labelRows = alert.alert_labels || []
  const annotationRows = alert.alert_annotations || []

  const labelsColumns = [
    {
      flex: 0.025,
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
            <Box sx={{ display: 'flex', flexDirection: 'column' , overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Tooltip placement='top' arrow>
                <Typography title={String(row?.name)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                  {row?.name}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.075,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography title={String(row?.value)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                  {row?.value}
                </Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  const groupLabelsColumns = [
    {
      flex: 0.025,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography title={String(row?.name)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                  {row?.name}
                </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.075,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography title={String(row?.value)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                  {row?.value}
                </Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  const annotationsColumns = [
    {
      flex: 0.025,
      minWidth: 100,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis'  }}>
              <Typography title={String(row?.name)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                {row?.name}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.075,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography title={String(row?.value)} noWrap overflow={'hidden'} textOverflow={'ellipsis'}>
                  {row?.value}
                </Typography>
            </Box>
          </Box>
        )
      }
    }
  ]

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleFilterModelChange = newModel => {
    setFilterModel(newModel)
  }

  return (
    <Box sx={{ m: 5 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='Task history detail tabs'>
            <Tab label={t('Details')} value='1' />
            <Tab label={t('Group Labels')} value='2' />
            <Tab label={t('Alert Labels')} value='3' />
            <Tab label={t('Alert Annotations')} value='4' />
          </TabList>
        </Box>
        <TabPanel value='1'>
          <CustomDataGrid
            rows={groupDetailsRows}
            columns={groupDetailsColumns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoHeight
            disablePagination={true} // Assuming your CustomDataGrid accepts this prop to disable pagination
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
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
                message: 'No SLOs found'
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
          {groupLabelRows.length > 0 ? (
            <CustomDataGrid
              rows={groupLabelRows}
              columns={groupLabelsColumns}
              pageSize={10}
              getRowId={row => row.name}
              rowsPerPageOptions={[10]}
              autoHeight
              disablePagination={true} // Assuming your CustomDataGrid accepts this prop to disable pagination
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              components={{ Toolbar: CustomTaskToolbar }}
              componentsProps={{
                baseButton: {
                  variant: 'outlined'
                },
                toolbar: {
                  showQuickFilter: true
                }
              }}
            />
          ) : (
            <Typography variant='body2'>No alert labels available.</Typography>
          )}
        </TabPanel>
        <TabPanel value='3'>
          {labelRows.length > 0 ? (
            <CustomDataGrid
              rows={labelRows}
              columns={labelsColumns}
              pageSize={10}
              getRowId={row => row.name}
              rowsPerPageOptions={[10]}
              autoHeight
              disablePagination={true} // Assuming your CustomDataGrid accepts this prop to disable pagination
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              components={{ Toolbar: CustomTaskToolbar }}
              componentsProps={{
                baseButton: {
                  variant: 'outlined'
                },
                toolbar: {
                  showQuickFilter: true
                }
              }}
            />
          ) : (
            <Typography variant='body2'>No alert labels available.</Typography>
          )}
        </TabPanel>
        <TabPanel value='4'>
          {annotationRows.length > 0 ? (
            <CustomDataGrid
              rows={annotationRows}
              getRowId={row => row.name}
              columns={annotationsColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoHeight
              disablePagination={true} // Assuming your CustomDataGrid accepts this prop to disable pagination
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              components={{ Toolbar: CustomTaskToolbar }}
              componentsProps={{
                baseButton: {
                  variant: 'outlined'
                },
                toolbar: {
                  showQuickFilter: true
                }
              }}
            />
          ) : (
            <Typography variant='body2'>No alert annotations available.</Typography>
          )}
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default AlertDetailPanel
