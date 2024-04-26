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
  GridToolbarQuickFilter
} from '@mui/x-data-grid-pro'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'
import { parseISO, format } from 'date-fns'
import Link from 'next/link'
import Tooltip from '@mui/material/Tooltip'
import themeConfig from 'src/configs/themeConfig'

const editmode = false
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

const ActiveAlertsDetailPanel = ({ alert }) => {
  const [value, setValue] = useState('1')
  const [filterModel, setFilterModel] = useState({ items: [] })
  const { t } = useTranslation()
  const theme = useTheme()

  const receivers = alert.receivers || [];
  const labelRows = alert.alert_labels || [];
  const annotationRows = alert.alert_annotations || [];

  const labelsColumns = [
      {
        flex: 0.025,
        minWidth: 100,
        field: 'name',
        editable: editmode,
        headerName: t('Name'),
        renderCell: params => {
          const { row } = params
  
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Tooltip title={String(row?.name)} placement="top" arrow>
                  <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
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
        minWidth: 100,
        field: 'value',
        editable: editmode,
        headerName: t('Value'),
        renderCell: params => {
          const { row } = params
  
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Tooltip title={String(row?.value)} placement="top" arrow>
                  <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row?.value}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>
          )
        }
      }
  ];

  const receiversColumns = [
    {
      flex: 0.025,
      minWidth: 100,
      field: 'name',
      editable: editmode,
      headerName: t('Name'),
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Tooltip title={String(row?.name)} placement="top" arrow>
                <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {row?.name}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        )
      }
    }
  ];

  const annotationsColumns = [
      {
        flex: 0.025,
        minWidth: 100,
        field: 'name',
        editable: editmode,
        headerName: t('Name'),
        renderCell: params => {
          const { row } = params
  
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Tooltip title={String(row?.name)} placement="top" arrow>
                  <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
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
        minWidth: 100,
        field: 'value',
        editable: editmode,
        headerName: t('Value'),
        renderCell: params => {
          const { row } = params
  
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Tooltip title={String(row?.value)} placement="top" arrow>
                  <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row?.value}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>
          )
        }
      }
  ];

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
            <Tab label={t('Alert Labels')} value='1' />
            <Tab label={t('Alert Annotations')} value='2' />
            <Tab label={t('Receivers')} value='3' />
          </TabList>
        </Box>
         <TabPanel value='1'>
          {labelRows.length > 0 ? (
            <CustomDataGrid
              rows={labelRows}
              columns={labelsColumns}
              pageSize={10}
              getRowId={(row) => row.name}
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
          <TabPanel value='2'>
          {annotationRows.length > 0 ? (
            <CustomDataGrid
              rows={annotationRows}
              getRowId={(row) => row.name}
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
          <TabPanel value='3'>
          {receivers.length > 0 ? (
            <CustomDataGrid
              rows={receivers}
              columns={receiversColumns}
              pageSize={10}
              getRowId={(row) => row.name}
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
            <Typography variant='body2'>No receivers available.</Typography>
          )}
          </TabPanel>

      </TabContext>
    </Box>
  )
}


export default ActiveAlertsDetailPanel
