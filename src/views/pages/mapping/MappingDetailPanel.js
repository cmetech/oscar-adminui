// ** React Imports
import React, { useState } from 'react'

// ** MUI Imports
import { Box, Typography, Tab } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MuiTabList from '@mui/lab/TabList'
import { styled, useTheme } from '@mui/material/styles'
import { atom, useAtom, useSetAtom } from 'jotai'
import { timezoneAtom } from 'src/lib/atoms'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Icon } from '@iconify/react';

// ** DataGrid Imports
import { CustomDataGrid } from 'src/lib/styled-components'
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter,
  GridLogicOperator
} from '@mui/x-data-grid-pro'


// ** Translation Hook
import { useTranslation } from 'react-i18next'

// ** Styled Components
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

 const MappingDetailPanel = props => {

    const [value, setValue] = useState('1')
    const { row } = props
    const { t } = useTranslation()
  
    const [timezone] = useAtom(timezoneAtom)
  
    const handleChange = (event, newValue) => {
      setValue(newValue)
    }
   
    const [showValueMetadata, setShowValueMetadata] = useState({}); // Store show/hide state per row

    const handleToggleValueVisibilityMetadata = (rowId) => {
      setShowValueMetadata((prev) => ({
        ...prev,
        [rowId]: !prev[rowId], // Toggle visibility for specific row by rowId
      }));
    };
   
    const [showValueElement, setShowValueElement] = useState({}); // Store show/hide state per row

    const handleToggleValueVisibilityElement = (rowId) => {
      setShowValueElement((prev) => ({
        ...prev,
        [rowId]: !prev[rowId], // Toggle visibility for specific row by rowId
      }));
    };
   
    // Define columns for metadata DataGrid
    const metadataColumns = [
      {
        field: 'key',
        headerName: t('Key'),
        flex: 0.015,
        width: 75,
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
              <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography noWrap overflow='hidden' textOverflow='ellipsis' title={row.key.toUpperCase()}>
                  {row.key.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          )
        }
      },
      {
        field: 'value',
        headerName: t('Value'),
        flex: 0.025,
        minWidth: 275,
        renderCell: params => {
          const { row } = params
          const isVisible = showValueMetadata[row.id] ?? false;

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
              <Typography
                  noWrap={false} // This is important to allow multiline text
                  sx={{
                    whiteSpace: 'normal', // Ensures the text wraps normally
                    wordWrap: 'break-word', // Helps break long words that don't fit
                    wordBreak: 'break-word', // Helps with very long words
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={row.value.toUpperCase()}
                >
                  {isVisible ? row.value.toUpperCase() : '********'}
                </Typography>
              </Box>
            <IconButton
              aria-label="toggle value visibility"
              onClick={() => handleToggleValueVisibilityMetadata(row.id)} // Pass row.id to track state for each row
              sx={{ marginLeft: 1 }}
            >
              <Icon icon={isVisible ? 'mdi:eye-outline' : 'mdi:eye-closed'} />
            </IconButton>
          </Box>
          )
        }
      }
    ]
   
   
   const elementColumns = [
      {
        field: 'key',
        headerName: t('Key'),
        flex: 0.015,
        width: 75,
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
              <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography noWrap overflow='hidden' textOverflow='ellipsis' title={row.key.toUpperCase()}>
                  {row.key.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          )
        }
      },
      {
        field: 'value',
        headerName: t('Value'),
        flex: 0.025,
        minWidth: 275,
        renderCell: params => {
          const { row } = params;
          const isVisible = showValueElement[row.id] ?? false;
      
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
                <Typography
                  noWrap={false} // This is important to allow multiline text
                  sx={{
                    whiteSpace: 'normal', // Ensures the text wraps normally
                    wordWrap: 'break-word', // Helps break long words that don't fit
                    wordBreak: 'break-word', // Helps with very long words
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={row.value.toUpperCase()}
                >
                  {isVisible ? row.value.toUpperCase() : '********'}
                </Typography>
              </Box>
              <IconButton
                aria-label="toggle value visibility"
                onClick={() => handleToggleValueVisibilityElement(row.id)} // Pass row.id to track state for each row
                sx={{ marginLeft: 1 }}
              >
                <Icon icon={isVisible ? 'mdi:eye-outline' : 'mdi:eye-closed'} />
              </IconButton>
            </Box>
          );
        }
      }
     ]

    return (
      <Box sx={{ m: 5 }}>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='Mapping Element and Mapping Metadata tabs'>
            <Tab label={t('Mapping Element')} value='1' />
            <Tab label={t('Mapping Metadata')} value='2' />
          </TabList>
          <TabPanel value='1'>
            <CustomDataGrid
              rows={row.element.map((el, index) => ({
                id: index,
                ...el
              }))}
              columns={elementColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
            />
          </TabPanel>
          <TabPanel value='2'>
            <CustomDataGrid
              rows={row.metadata.map((md, index) => ({
                id: index,
                ...md
              }))}
              columns={metadataColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
            />
          </TabPanel>
        </TabContext>
      </Box>
    ) 


  }


export default MappingDetailPanel