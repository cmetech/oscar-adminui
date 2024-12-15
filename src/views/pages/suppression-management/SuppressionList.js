import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { DataGrid } from '@mui/x-data-grid'
import { useTheme } from '@mui/material/styles'
import toast from 'react-hot-toast'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'

const SuppressionsList = ({ setTotalCount }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [suppressions, setSuppressions] = useState([])
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectionModel, setSelectionModel] = useState([])

  const fetchSuppressions = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/suppressions', {
        params: {
          perPage: pageSize,
          page: page + 1
        }
      })
      setSuppressions(response.data.items)
      setTotal(response.data.total)
      setTotalCount(response.data.total)
    } catch (error) {
      console.error('Error fetching suppressions:', error)
      toast.error(t('Failed to fetch suppressions'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppressions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const columns = [
    { field: 'id', headerName: t('ID'), minWidth: 70 },
    { field: 'name', headerName: t('Name'), minWidth: 200, flex: 1 },
    { field: 'description', headerName: t('Description'), minWidth: 300, flex: 2 },
    {
      field: 'actions',
      headerName: t('Actions'),
      minWidth: 150,
      renderCell: params => (
        <Box>
          {/* Include action buttons for edit and delete */}
          <IconButton color='primary' onClick={() => handleEdit(params.row)}>
            <Icon icon='mdi:pencil-outline' />
          </IconButton>
          <IconButton color='error' onClick={() => handleDelete(params.row)}>
            <Icon icon='mdi:delete-outline' />
          </IconButton>
        </Box>
      )
    }
  ]

  const handleEdit = row => {
    // Implement edit functionality
  }

  const handleDelete = row => {
    // Implement delete functionality
  }

  return (
    <Card>
      <DataGrid
        autoHeight
        rows={suppressions}
        rowCount={total}
        loading={loading}
        pagination
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        paginationMode='server'
        onPageChange={newPage => setPage(newPage)}
        onPageSizeChange={newSize => setPageSize(newSize)}
        columns={columns}
        checkboxSelection
        onSelectionModelChange={ids => setSelectionModel(ids)}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.paper
          }
        }}
      />
    </Card>
  )
}

export default SuppressionsList
