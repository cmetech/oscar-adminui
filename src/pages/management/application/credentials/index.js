// ** React Imports
import { useContext, useState, forwardRef, Fragment, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  connectionsIdsAtom,
  refetchConnectionsTriggerAtom,
  secretsIdsAtom,
  refetchSecretsTriggerAtom
} from 'src/lib/atoms'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Fade from '@mui/material/Fade'
import LinearProgress from '@mui/material/LinearProgress'

import { styled, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import ConnectionsList from 'src/views/pages/connection-management/ConnectionsList'
import AddConnectionWizard from 'src/views/pages/connection-management/forms/AddConnectionWizard'
import SecretsList from 'src/views/pages/secrets-management/SecretsList'
import AddSecretsWizard from 'src/views/pages/secrets-management/forms/AddSecretsWizard'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useAtom } from 'jotai'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

// ** Styled Components
const TabListStyled = styled(TabList)(({ theme }) => ({
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

// ** Confirmation Modal
const ConfirmationExportModal = ({ isOpen, onClose, onConfirm, tabValue }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('Are you sure you want to export all selected')} {tabValue === '1' ? t('connections') : t('secrets')}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:file-export' />}
        >
          {t('Export')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ** More Actions Dropdown
const MoreActionsDropdown = ({ onDelete, onTest, onExport, onImport, tabValue }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  // Define which tabs show which menu items
  const showImportTab = true // Show Import for both Connections and Secrets
  const showExportTab = true // Show Export for both tabs
  // Remove showTestTab since we're disabling test functionality

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: 'text.secondary'
    }
  }

  return (
    <Fragment>
      <IconButton color='secondary' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Icon icon='mdi:menu' />
      </IconButton>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
      >
        {showExportTab && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onExport()
              handleDropdownClose()
            }}
          >
            <Box sx={styles}>
              <Icon icon='mdi:file-export-outline' />
              {t('Export')}
            </Box>
          </MenuItem>
        )}
        {showImportTab && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onImport()
              handleDropdownClose()
            }}
          >
            <Box sx={styles}>
              <Icon icon='mdi:file-import-outline' />
              {t('Import')}
            </Box>
          </MenuItem>
        )}
        <MenuItem
          sx={{ p: 0 }}
          onClick={() => {
            onDelete()
            handleDropdownClose()
          }}
        >
          <Box sx={styles}>
            <Icon icon='mdi:delete-outline' />
            {t('Delete')}
          </Box>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

// ** Confirmation Modal
const ConfirmationDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Delete all selected?')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          size='large'
          variant='contained'
          color='error'
          autoFocus
          startIcon={<Icon icon='mdi:delete-forever' />}
        >
          {t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ** Secrets Upload Dialog
const SecretsUploadDialog = ({ open, onClose }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [, setSecretsRefetchTrigger] = useAtom(refetchSecretsTriggerAtom)
  const fileInputRef = useRef(null)
  const { t } = useTranslation()

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      setFile(file)
      setFileName(file.name)
    } else {
      setFile(null)
      setFileName('')
    }
  }

  const handleClose = () => {
    setFile(null)
    setFileName('')
    setUploadProgress(0)
    setIsUploading(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error(t('Please select a file to upload.'))

      return
    }

    let simulateProcessing = null

    try {
      setIsUploading(true)
      let simulatedProgress = 0

      // Start the simulation before the request is sent
      simulateProcessing = setInterval(() => {
        simulatedProgress += Math.random() * 10
        if (simulatedProgress >= 90) {
          simulatedProgress = 90
        }
        setUploadProgress(simulatedProgress)
      }, 500)

      // Read the Excel file using ExcelJS
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(await file.arrayBuffer())

      // Get the first worksheet
      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        throw new Error('No worksheet found in the Excel file')
      }

      // Get headers from the first row
      const headers = worksheet.getRow(1).values
      if (headers[0] === undefined) headers.shift()

      // Process each row
      const rows = []
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header row
          const rowData = {}
          row.values.forEach((value, index) => {
            if (headers[index - 1]) {
              rowData[headers[index - 1]] = value
            }
          })
          rows.push(rowData)
        }
      })

      let successCount = 0
      let errorCount = 0
      const errors = []

      // Process each row
      for (const row of rows) {
        try {
          if (!row['Path'] || !row['Key'] || !row['Value']) {
            errors.push(`Missing required fields for secret: ${row['Path'] || 'Unknown'}`)
            errorCount++
            continue
          }

          // Format the secret data
          const path = `taskmanager/${row['Path']}`

          const secret = {
            [row['Key']]: row['Value']
          }

          // Make the API call
          await axios.post('/api/secrets', { path, secret })
          successCount++

          // Update progress
          simulatedProgress = ((successCount + errorCount) / rows.length) * 100
          setUploadProgress(simulatedProgress)
        } catch (error) {
          console.error('Error creating secret:', error)
          errors.push(`Failed to create secret ${row['Path']}: ${error.message}`)
          errorCount++
        }
      }

      // Clear the simulation and show results
      clearInterval(simulateProcessing)
      setUploadProgress(100)

      if (successCount > 0) {
        toast.success(t(`Successfully created ${successCount} secrets`))
      }
      if (errorCount > 0) {
        toast.error(t(`Failed to create ${errorCount} secrets`))
        errors.forEach(error => toast.error(error))
      }

      setSecretsRefetchTrigger(Date.now())
      setTimeout(() => {
        handleClose()
      }, 1000)
    } catch (error) {
      if (simulateProcessing) {
        clearInterval(simulateProcessing)
      }
      console.error('Error uploading file:', error)
      setIsUploading(false)
      toast.error(t('Error uploading file'))
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('Upload Secrets')}</DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          accept='.xlsx,.xls'
          style={{ display: 'none' }}
        />
        <Button onClick={handleButtonClick} size='large' variant='contained' color='primary' disabled={isUploading}>
          {t('Choose File')}
        </Button>
        {fileName && (
          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            {t('Selected file')}: {fileName}
          </Typography>
        )}

        {isUploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant='determinate' value={uploadProgress} />
            <Typography variant='subtitle2' align='center'>
              {Math.round(uploadProgress)}% {t('uploaded')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
          disabled={isUploading}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:upload-multiple' />}
          disabled={isUploading || !file}
        >
          {isUploading ? t('Uploading...') : t('Upload')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Add ConnectionUploadDialog component
const ConnectionUploadDialog = ({ open, onClose }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [, setConnectionsRefetchTrigger] = useAtom(refetchConnectionsTriggerAtom)
  const { t } = useTranslation()
  const fileInputRef = useRef(null)

  const handleFileSelect = event => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const resetForm = () => {
    setFile(null)
    setFileName('')
    setIsUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload.')

      return
    }

    setIsUploading(true)
    let simulatedProgress = 0
    let successCount = 0
    let errorCount = 0
    const errors = []

    try {
      // Read the Excel file using ExcelJS
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(await file.arrayBuffer())

      // Get the first worksheet
      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        throw new Error('No worksheet found in the Excel file')
      }

      // Get headers from the first row
      const headers = worksheet.getRow(1).values
      // Remove empty first cell if present (ExcelJS quirk)
      if (headers[0] === undefined) headers.shift()

      // Process each row
      const rows = []
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header row
          const rowData = {}
          row.values.forEach((value, index) => {
            if (headers[index - 1]) {
              // index-1 because ExcelJS row values are 1-based
              rowData[headers[index - 1]] = value
            }
          })
          rows.push(rowData)
        }
      })

      // Process each row
      for (const row of rows) {
        try {
          // Validate required fields
          if (!row['Connection ID'] || !row['Connection Type'] || !row['Host']) {
            errors.push(`Missing required fields for connection: ${row['Connection ID'] || 'Unknown'}`)
            errorCount++
            continue
          }

          // Format the connection data
          const connectionData = {
            name: row['Connection ID']?.toString(),
            type: row['Connection Type']?.toString(),
            host: row['Host']?.toString(),
            port: row['Port'] ? parseInt(row['Port'], 10) : null,
            schema: row['Schema']?.toString() || null,
            login: row['Login']?.toString() || null,
            password: row['Password']?.toString() || null,
            description: row['Description']?.toString() || null
          }

          // Make the API call
          await axios.post('/api/connections', connectionData)
          successCount++

          // Update progress
          simulatedProgress = ((successCount + errorCount) / rows.length) * 100
          setUploadProgress(simulatedProgress)
        } catch (error) {
          console.error('Error creating connection:', error)
          errors.push(`Failed to create connection ${row['Connection ID']}: ${error.message}`)
          errorCount++
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} connections`)
        setConnectionsRefetchTrigger(Date.now())
      }
      if (errorCount > 0) {
        toast.error(`Failed to create ${errorCount} connections`)
        errors.forEach(error => toast.error(error))
      }

      resetForm()
      onClose()
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Error processing file: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('Upload Connections')}</DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type='file'
          accept='.xlsx,.xls'
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        {/* Custom styled button */}
        <Button size='large' color='primary' variant='contained' onClick={handleButtonClick} disabled={isUploading}>
          {t('Choose File')}
        </Button>
        {fileName && (
          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            Selected file: {fileName}
          </Typography>
        )}

        {isUploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant='determinate' value={uploadProgress} />
            <Typography variant='subtitle2' align='center'>
              {Math.round(uploadProgress)}% uploaded
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          size='large'
          variant='outlined'
          color='secondary'
          startIcon={<Icon icon='mdi:close' />}
          disabled={isUploading}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:upload-multiple' />}
          disabled={isUploading || !file}
        >
          {isUploading ? t('Uploading...') : t('Upload')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const CredentialsManager = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { t } = useTranslation()
  const theme = useTheme()

  // ** State
  const [value, setValue] = useState('1')
  const [connectionTotal, setConnectionTotal] = useState(0)
  const [secretsTotal, setSecretsTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [selectedConnectionIds, setSelectedConnectionIds] = useAtom(connectionsIdsAtom)
  const [, setConnectionsRefetchTrigger] = useAtom(refetchConnectionsTriggerAtom)
  const [selectedSecretIds, setSelectedSecretIds] = useAtom(secretsIdsAtom)
  const [, setSecretsRefetchTrigger] = useAtom(refetchSecretsTriggerAtom)
  const [openConnectionUploadDialog, setOpenConnectionUploadDialog] = useState(false)
  const [openSecretsUploadDialog, setOpenSecretsUploadDialog] = useState(false)

  const handleDelete = () => {
    console.log('Current value:', value)
    console.log('Selected Secret IDs:', selectedSecretIds)
    if (value === '1') {
      // Handle connection deletion
      if (selectedConnectionIds.length > 0) {
        setIsDeleteModalOpen(true)
      } else {
        toast.error(t('No connections selected for deletion'))
      }
    } else {
      // Handle secret deletion
      if (selectedSecretIds.length > 0) {
        setIsDeleteModalOpen(true)
      } else {
        console.log('No secrets selected')
        toast.error(t('No secrets selected for deletion'))
      }
    }
  }

  const handleTest = async () => {
    try {
      const response = await axios.post('/api/connections/test', { connection_ids: selectedConnectionIds })
      if (response.data.status === 'success') {
        toast.success('Connection test successful')
      } else {
        toast.error('Connection test failed')
      }
    } catch (error) {
      console.error('Error testing connections:', error)
      toast.error('Connection test failed')
    }
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (value === '1') {
      // Handle connection deletion
      console.log('Deleting connections', selectedConnectionIds)

      const deletePromises = selectedConnectionIds.map(connectionId =>
        axios
          .delete(`/api/connections/${connectionId}`)
          .then(() => ({ success: true, connectionId }))
          .catch(error => ({ success: false, connectionId, error }))
      )

      try {
        const results = await Promise.all(deletePromises)

        results.forEach(result => {
          if (result.success) {
            toast.success(`Connection ${result.connectionId} deleted successfully`)
          } else {
            console.error(`Error deleting connection ${result.connectionId}:`, result.error)
            toast.error(`Failed to delete connection ${result.connectionId}`)
          }
        })

        setConnectionsRefetchTrigger(Date.now())
        setSelectedConnectionIds([])
      } catch (error) {
        console.error('Unexpected error during connection deletion:', error)
        toast.error('An unexpected error occurred during connection deletion')
      }
    } else {
      // Handle secret deletion
      try {
        const deletePromises = selectedSecretIds.map(id => {
          const [path, key] = id.split('-')

          return axios.delete('/api/secrets/delete', {
            params: {
              path,
              key,
              delete_empty_paths: true
            }
          })
        })

        const results = await Promise.all(deletePromises)

        const successCount = results.filter(result => result.status === 200).length
        const failCount = selectedSecretIds.length - successCount

        if (successCount > 0) {
          toast.success(t(`${successCount} secret(s) deleted successfully`))
        }
        if (failCount > 0) {
          toast.error(t(`Failed to delete ${failCount} secret(s)`))
        }

        setSecretsRefetchTrigger(Date.now())
        setSelectedSecretIds([])
      } catch (error) {
        console.error('Error deleting secrets:', error)
        toast.error(t('An error occurred while deleting secrets'))
      }
    }

    setIsDeleteModalOpen(false)
  }

  const handleConfirmExport = async () => {
    try {
      if (value === '1') {
        // Existing connections export logic
        const response = await axios.get('/api/connections', {
          params: {
            include_credentials: true
          }
        })

        // Log the response to see its structure
        console.log('API Response:', response.data)

        // Handle the connections data - use the connections array from the response
        const allConnections = response.data.connections

        // Use selected connections if any are selected, otherwise use all connections
        const connectionsToExport =
          selectedConnectionIds.length > 0
            ? allConnections.filter(conn => selectedConnectionIds.includes(conn.connection_id))
            : allConnections

        // Create workbook
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Connections')

        // Define columns - now including login and password
        worksheet.columns = [
          { header: 'Connection ID', key: 'connection_id', width: 20 },
          { header: 'Connection Type', key: 'conn_type', width: 20 },
          { header: 'Host', key: 'host', width: 30 },
          { header: 'Port', key: 'port', width: 10 },
          { header: 'Schema', key: 'schema', width: 20 },
          { header: 'Login', key: 'login', width: 20 },
          { header: 'Password', key: 'password', width: 30 },
          { header: 'Description', key: 'description', width: 40 }
        ]

        // Add data rows with null checks
        connectionsToExport.forEach(conn => {
          if (conn) {
            worksheet.addRow({
              connection_id: conn.connection_id?.toString().toUpperCase() ?? '',
              conn_type: conn.conn_type?.toString().toUpperCase() ?? '',
              host: conn.host?.toString().toUpperCase() ?? '',
              port: conn.port?.toString() ?? '',
              schema: conn.schema?.toString().toUpperCase() ?? '',
              login: conn.login?.toString() ?? '',
              password: conn.password?.toString() ?? '',
              description: conn.description?.toString() ?? ''
            })
          }
        })

        // Style the header row
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true }
        headerRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          }
        })

        // Add protection to the password column
        worksheet.getColumn('password').protection = {
          locked: true
        }

        // Auto-filter for all columns
        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: worksheet.columns.length }
        }

        // Freeze the header row
        worksheet.views = [{ state: 'frozen', ySplit: 1 }]

        // Generate the Excel file
        const buffer = await workbook.xlsx.writeBuffer()

        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        saveAs(blob, `connections_export_${new Date().toISOString().split('T')[0]}.xlsx`)

        toast.success(`Successfully exported ${connectionsToExport.length} connections`)
        handleCloseExportModal()
      } else {
        const path = 'taskmanager' // Fixed path for secrets

        const response = await axios.get('/api/secrets', {
          params: {
            path: path,
            format: 'nested'
          }
        })

        // Create workbook
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Secrets')

        // Define columns
        worksheet.columns = [
          { header: 'Path', key: 'path', width: 30 },
          { header: 'Key', key: 'key', width: 20 },
          { header: 'Value', key: 'value', width: 40 }
        ]

        // Format the secrets data for Excel
        const secretsToExport = Object.entries(response.data.keys[0]).map(([key, value]) => ({
          path: path,
          key: key,
          value: value
        }))

        // Filter by selected secrets if any are selected
        const secretsToWrite =
          selectedSecretIds.length > 0
            ? secretsToExport.filter(secret => selectedSecretIds.includes(`${secret.path}/${secret.key}`))
            : secretsToExport

        // Add data rows
        secretsToWrite.forEach(secret => {
          worksheet.addRow({
            path: secret.path,
            key: secret.key,
            value: secret.value
          })
        })

        // Style the header row
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true }
        headerRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          }
        })

        // Add protection to the value column
        worksheet.getColumn('value').protection = {
          locked: true
        }

        // Auto-filter for all columns
        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: worksheet.columns.length }
        }

        // Freeze the header row
        worksheet.views = [{ state: 'frozen', ySplit: 1 }]

        // Generate the Excel file
        const buffer = await workbook.xlsx.writeBuffer()

        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        saveAs(blob, `secrets_export_${new Date().toISOString().split('T')[0]}.xlsx`)

        toast.success(`Successfully exported ${secretsToWrite.length} secrets`)
        handleCloseExportModal()
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export secrets')
    }
  }

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false)
  }

  const handleChange = (event, newValue) => {
    console.log('Tab changed to:', newValue)
    setValue(newValue)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleAddSuccess = () => {
    handleCloseModal()
    if (value === '1') {
      setConnectionsRefetchTrigger(Date.now())
    } else {
      setSecretsRefetchTrigger(Date.now())
    }
  }

  const handleImport = () => {
    if (value === '1') {
      setOpenConnectionUploadDialog(true)
    } else {
      setOpenSecretsUploadDialog(true)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Credential Management')}</Typography>
          <Box display='flex' alignItems='center'>
            <Button
              variant='contained'
              color='secondary'
              sx={{ marginRight: 1 }}
              startIcon={<Icon icon='mdi:plus' />}
              onClick={handleOpenModal}
            >
              {value === '1' ? t('Connections') : t('Secrets')}
            </Button>
            <MoreActionsDropdown
              onDelete={handleDelete}
              onTest={handleTest}
              onExport={handleExport}
              onImport={handleImport}
              tabValue={value}
            />
          </Box>
        </Box>
        <TabContext value={value}>
          <TabListStyled onChange={handleChange} aria-label='credentials'>
            <Tab
              value='1'
              label={connectionTotal === 0 ? t('Connections') : `${t('Connections')} (${connectionTotal})`}
              icon={<Icon icon='mdi:connection' />}
              iconPosition='start'
            />
            <Tab
              value='2'
              label={secretsTotal === 0 ? t('Secrets') : `${t('Secrets')} (${secretsTotal})`}
              icon={<Icon icon='mdi:key-variant' />}
              iconPosition='start'
            />
          </TabListStyled>
          <TabPanel value='1'>
            <ConnectionsList set_total={setConnectionTotal} total={connectionTotal} />
          </TabPanel>
          <TabPanel value='2'>
            <SecretsList set_total={setSecretsTotal} total={secretsTotal} />
          </TabPanel>
        </TabContext>
      </Grid>
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={openModal}
        onClose={handleCloseModal}
        TransitionComponent={Transition}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {value === '1' ? t('Add Connection Wizard') : t('Add Secrets Wizard')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <IconButton size='small' onClick={handleCloseModal} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              {value === '1' ? t('Add Connection Information') : t('Add Secrets Information')}
            </Typography>
            <Typography variant='body2'>{t('Information submitted will be effective immediately.')}</Typography>
          </Box>
          {value === '1' ? (
            <AddConnectionWizard onSuccess={handleAddSuccess} onClose={handleCloseModal} />
          ) : (
            <AddSecretsWizard onSuccess={handleAddSuccess} onClose={handleCloseModal} />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmationDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
      <ConfirmationExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        onConfirm={handleConfirmExport}
        tabValue={value}
      />
      <ConnectionUploadDialog open={openConnectionUploadDialog} onClose={() => setOpenConnectionUploadDialog(false)} />
      <SecretsUploadDialog open={openSecretsUploadDialog} onClose={() => setOpenSecretsUploadDialog(false)} />
    </Grid>
  )
}

CredentialsManager.acl = {
  action: 'manage',
  subject: ['connections', 'secrets']
}

export default CredentialsManager
