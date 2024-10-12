// src/views/pages/rules/ActiveRules.js
import React, { useState, useEffect, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DataGridPro, GridToolbarContainer, GridLogicOperator } from '@mui/x-data-grid-pro'
import { Card, Box, Button, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { styled, useTheme } from '@mui/material/styles'
import axios from 'axios'
import UpdateRuleForm from 'src/views/pages/rules/forms/UpdateRuleForm'
import { toast } from 'react-hot-toast'
import NoRowsOverlay from 'src/views/components/NoRowsOverlay'
import NoResultsOverlay from 'src/views/components/NoResultsOverlay'

// Import any additional necessary components or functions
// For example, if there are custom dialogs or date/time formatting utils used in ActiveProbes.js

const CustomDataGrid = styled(DataGridPro)(({ theme }) => ({
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.customColors.tableHeaderBg,
    color: theme.palette.customColors.tableHeaderColor,
    fontSize: '1rem',
    lineHeight: '1.5',
    '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
      outline: 'none'
    }
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: theme.palette.customColors.evenRowBg
  },
  '& .MuiDataGrid-row:nth-of-type(odd)': {
    backgroundColor: theme.palette.customColors.oddRowBg
  },
  '& .MuiDataGrid-cell': {
    borderColor: theme.palette.customColors.cellBorderColor,
    '&:focus, &:focus-within': {
      outline: 'none'
    }
  }
  // Include any other custom styles as needed
}))

const ActiveRules = forwardRef((props, ref) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentRule, setCurrentRule] = useState(null)

  const fetchRules = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/rules')
      setRows(response.data.records || response.data)
    } catch (error) {
      console.error('Failed to fetch rules', error)
      toast.error(t('Failed to fetch rules'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleEdit = rule => {
    setCurrentRule(rule)
    setEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setCurrentRule(null)
    fetchRules()
  }

  // Update the columns definitions to match the formatting in ActiveProbes.js
  const columns = [
    {
      flex: 0.03,
      minWidth: 150,
      field: 'name',
      headerName: t('Name'),
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
              <Typography title={row?.name} noWrap overflow='hidden' textOverflow='ellipsis'>
                {row?.name?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 150,
      field: 'namespace',
      headerName: t('Namespace'),
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
              <Typography title={row?.namespace} noWrap overflow='hidden' textOverflow='ellipsis'>
                {row?.namespace}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 200,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography title={row?.description} noWrap overflow='hidden' textOverflow='ellipsis'>
                {row?.description}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.03,
      minWidth: 150,
      field: 'enabled',
      headerName: t('Enabled'),
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const { row } = params

        return (
          <Typography variant='body2' align='center'>
            {row?.enabled ? t('Yes') : t('No')}
          </Typography>
        )
      }
    },
    {
      flex: 0.02,
      field: 'actions',
      headerName: t('Actions'),
      type: 'string',
      minWidth: 200,
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Button variant='text' onClick={() => handleEdit(row)} startIcon={<Icon icon='mdi:pencil-outline' />}>
              {t('Edit')}
            </Button>
            {/* Add other action buttons if needed */}
          </Box>
        )
      }
    }
  ]

  return (
    <Box>
      <Card>
        <CustomDataGrid
          autoHeight
          rows={rows}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: GridToolbarContainer,
            NoRowsOverlay,
            NoResultsOverlay
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true
            },
            noRowsOverlay: {
              message: t('No Rules found')
            },
            noResultsOverlay: {
              message: t('No Results Found')
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
                  sx: { mt: 'auto' }
                },
                operatorInputProps: {
                  variant: 'outlined',
                  size: 'small'
                },
                valueInputProps: {
                  InputComponentProps: {
                    variant: 'outlined',
                    size: 'small'
                  }
                },
                deleteIconProps: {
                  sx: {
                    '& .MuiSvgIcon-root': {
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.customColors.brandYellow
                          : theme.palette.primary.main
                    }
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
                    theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                  color:
                    theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 255, 0.04)',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main,
                    color:
                      theme.palette.mode === 'dark'
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
          sx={{
            '& .MuiDataGrid-columnsPanel': {
              '& .MuiDataGrid-panelContent': {
                backgroundColor: theme.palette.customColors.tableHeaderBg,
                color: theme.palette.customColors.tableHeaderColor,
                '& .MuiFormControlLabel-root': {
                  '& .MuiCheckbox-root': {
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.customColors.brandYellow
                        : theme.palette.primary.main
                  }
                }
              },
              '& .MuiDataGrid-columnsPanelRow': {
                '& .MuiTypography-root': {
                  fontWeight: 'bold'
                }
              },
              '& .MuiDataGrid-columnsPanelFooter .MuiButton-outlined': {
                mb: 2,
                mt: 2,
                borderColor:
                  theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                color:
                  theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 255, 0.04)',
                  borderColor:
                    theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main,
                  color:
                    theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
                }
              },
              '& .MuiDataGrid-columnsPanelFooter .MuiButton-outlined:first-of-type': {
                mr: 2
              }
            },
            // Additional styling matching ActiveProbes.js
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.customColors.tableHeaderBg
                  : theme.palette.customColors.tableHeaderBgDark,
              color: theme.palette.customColors.tableHeaderColor,
              fontSize: '1rem'
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.customColors.tableRowBg
                  : theme.palette.customColors.tableRowBgDark
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.customColors.tableHoverBg
                  : theme.palette.customColors.tableHoverBgDark
            },
            // Remove cell focus outline
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />
      </Card>
      {editDialogOpen && currentRule && (
        <UpdateRuleForm open={editDialogOpen} onClose={handleCloseEditDialog} rule={currentRule} />
      )}
    </Box>
  )
})

export default ActiveRules
