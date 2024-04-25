// ** React Imports
import { useContext, useState, useEffect, forwardRef, Fragment, useRef } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { sloIdsAtom, refetchSloTriggerAtom } from 'src/lib/atoms'
import { predefinedRangesDayjs, today, todayRounded, yesterdayRounded } from 'src/lib/calendar-timeranges'
import dayjs from 'dayjs'

// ** MUI Imports
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import MuiTabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
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
import Fade from '@mui/material/Fade'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { styled, useTheme } from '@mui/material/styles'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { useForm, Controller, get } from 'react-hook-form'
import axios from 'axios'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import SLOList from 'src/views/pages/slo/SLOList'
import SLOEventHistoryList from 'src/views/pages/slo/SLOEventHistoryList'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { DateTimeRangePicker } from '@mui/x-date-pickers-pro/DateTimeRangePicker'
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// Form Dialog Components
import AddSLOWizard from 'src/views/pages/slo/forms/AddSLOWizard'
import toast from 'react-hot-toast'
import { useAtom } from 'jotai'
import { da } from 'date-fns/locale'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

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

const TextfieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode == 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
    }
  }
}))

// ** More Actions Dropdown
const MoreActionsDropdown = ({ onDelete, onExport, onDisable, onEnable, onUpload, tabValue }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const router = useRouter()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'SLOs',
      2: 'Event History'
    }

    return mapping[tabValue] || ''
  }

  const handleDropdownClose = url => {
    if (url) {
      console.log('url', url)
      router.push(url)
    }
    setAnchorEl(null)
  }

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
      color: 'text.primary'
    }
  }

  // Define tabs where the Delete menu item should be shown
  const deletableTabs = ['1']

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
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
      >
        {deletableTabs.includes(tabValue) && (
          <MenuItem
            sx={{ p: 0 }}
            onClick={() => {
              onDelete()
              handleDropdownClose()
            }}
          >
            <Box sx={styles}>
              <Icon icon='mdi:delete-forever-outline' />
              {t('Delete')} {t(getDynamicTitle(tabValue))}
            </Box>
          </MenuItem>
        )}
        {/* <MenuItem
          disabled
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
        <MenuItem
          sx={{ p: 0 }}
          onClick={() => {
            onUpload()
            handleDropdownClose()
          }}
        >
          <Box sx={styles}>
            <Icon icon='mdi:upload' />
            {t('Upload Tasks')}
          </Box>
        </MenuItem> */}
      </Menu>
    </Fragment>
  )
}

// ** Confirmation Modal
const ConfirmationDeleteModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'slos',
      2: 'event history'
    }

    return mapping[tabValue] || ''
  }

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

// ** Confirmation Modal
const ConfirmationDisableModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'tasks',
      2: 'task history'
    }

    return mapping[tabValue] || ''
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Disable all selected?')}</DialogContentText>
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
          startIcon={<Icon icon='mdi:minus-box' />}
        >
          {t('Disable')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ConfirmationEnableModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'tasks',
      2: 'task history'
    }

    return mapping[tabValue] || ''
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('Confirm Action')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('Enable all selected?')}</DialogContentText>
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
          color='info'
          autoFocus
          startIcon={<Icon icon='mdi:plus-box' />}
        >
          {t('Enable')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ** Confirmation Modal
const ConfirmationExportModal = ({ isOpen, onClose, onConfirm, tab }) => {
  const { t } = useTranslation()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'tasks',
      2: 'task history'
    }

    return mapping[tabValue] || ''
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to export all selected {getDynamicTitle(tab)}?</DialogContentText>
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

const TaskUploadDialog = ({ open, onClose, onSuccess, tab }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')

  const fileInputRef = useRef(null)

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
    onClose()
  }

  const { t } = useTranslation()

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload.')

      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Replace '/api/inventory/servers/bulk' with your Next.js API route that proxies the request
      const response = await axios.post('/api/inventory/servers/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Handle response here
      console.log(response.data)
      setFileName('')
      setFile(null)
      onClose() // Close the dialog on success
      toast.success('Tasks are being uploaded and processed.')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error uploading file')
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload Tasks</DialogTitle>
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
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the input
        />
        {/* Custom styled button */}
        <Button onClick={handleButtonClick} size='large' variant='contained' color='primary'>
          {t('Choose File')}
        </Button>
        {fileName && (
          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            Selected file: {fileName}
          </Typography>
        )}
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
          onClick={handleSubmit}
          size='large'
          variant='contained'
          color='warning'
          autoFocus
          startIcon={<Icon icon='mdi:upload-multiple' />}
        >
          {t('Upload')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Define a simple modal form component
const DynamicDialogForm = ({ open, handleClose, onSubmit, tab }) => {
  const { register, handleSubmit, reset } = useForm()
  const theme = useTheme()

  // Function to determine the dynamic text based on the selected tab
  const getDynamicTitle = tabValue => {
    const mapping = {
      1: 'Add SLO Wizard'
    }

    return mapping[tabValue] || 'Add SLO Wizard'
  }

  const getDynamicSubTitle = tabValue => {
    const mapping = {
      1: 'Add SLO Information'
    }

    return mapping[tabValue] || 'Add Information'
  }

  useEffect(() => {
    // Reset form when modal closes
    if (!open) reset()
  }, [open, reset])

  const handleSuccess = () => {
    handleClose()
  }

  const dynamicFields = () => {
    switch (tab) {
      case '1':
        return <AddSLOWizard onSuccess={handleSuccess} />

      // Add cases for other tabs with different fields
      default:
        return <Typography>Form not configured for this tab.</Typography>
    }
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {getDynamicTitle(tab)}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <IconButton
          size='small'
          onClick={() => handleClose()}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3 }}>
            {getDynamicSubTitle(tab)}
          </Typography>
          <Typography variant='body2'>Information submitted will be effective immediately.</Typography>
        </Box>
        {dynamicFields()}
      </DialogContent>
    </Dialog>
  )
}

const SLO = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
  const { t } = useTranslation()
  const theme = useTheme()

  const [value, setValue] = useState('1')
  const [sloTotal, setSloTotal] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSloIds, setSelectedSloIds] = useAtom(sloIdsAtom)
  const [, setRefetchTrigger] = useAtom(refetchSloTriggerAtom)

  const [dateRange, setDateRange] = useState([yesterdayRounded, todayRounded])
  const [onAccept, setOnAccept] = useState(value)

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    console.log('Deleting SLOs', selectedSloIds)

    // Generate an array of promises for deleting each task
    const deletePromises = selectedSloIds.map(sloId =>
      axios
        .delete(`/api/sli/${sloId}`)
        .then(() => ({ success: true, sloId }))
        .catch(error => ({ success: false, sloId, error }))
    )

    try {
      // Wait for all delete operations to complete
      const results = await Promise.all(deletePromises)

      // Handle results
      results.forEach(result => {
        if (result.success) {
          toast.success(`SLO ${result.sloId} deleted successfully`)
        } else {
          console.error(`Error deleting SLO ${result.sloId}:`, result.error)
          toast.error(`Failed to delete SLO ${result.sloId}`)
        }
      })

      // Refresh data or update UI as needed
      setRefetchTrigger(Date.now())

      // Optionally clear selected sloIds after deletion
      setSelectedSloIds([])
    } catch (error) {
      // This catch block may not be necessary since individual errors are caught above
      console.error('Unexpected error during SLO deletion:', error)
      toast.error('An unexpected error occurred during SLO deletion')
    }

    setIsDeleteModalOpen(false)
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  // Function to determine the dynamic text based on the selected tab
  const getDynamicText = tabValue => {
    const mapping = {
      1: t('SLO')
    }

    return mapping[tabValue] || 'Item'
  }

  const handleOnAccept = value => {
    console.log('onAccept', value)
    setOnAccept(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={10}>
          <Typography variant='h4'>{t('Service Level Objectives')}</Typography>
          <Box display='flex' alignItems='center'>
            {value === '1' && (
              <Fragment>
                <DateTimeRangePicker
                  calendars={2}
                  closeOnSelect={false}
                  value={dateRange}
                  defaultValue={[yesterdayRounded, todayRounded]}
                  disableFuture
                  views={['day', 'hours']}
                  timeSteps={{ minutes: 10 }}
                  viewRenderers={{ hours: renderDigitalClockTimeView }}
                  onChange={newValue => {
                    // console.log('Date range:', newValue)
                    setDateRange(newValue)
                  }}
                  onAccept={handleOnAccept}
                  slotProps={{
                    field: { dateSeparator: 'to' },
                    textField: ({ position }) => ({
                      size: 'small',
                      color: position === 'start' ? 'secondary' : 'secondary',
                      focused: true,
                      InputProps: {
                        endAdornment: <Icon icon='mdi:calendar' />
                      }
                    }),

                    desktopPaper: {
                      style: {
                        backgroundColor:
                          theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.common.white
                      }
                    },

                    day: {
                      sx: {
                        '& .MuiPickersDay-root': {
                          color:
                            theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
                          '&:hover': {
                            color:
                              theme.palette.mode === 'dark'
                                ? theme.palette.customColors.brandYellow
                                : theme.palette.primary.light
                          }
                        },
                        '& .MuiPickersDay-root.Mui-selected': {
                          color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white
                        }
                      }
                    },

                    shortcuts: {
                      items: predefinedRangesDayjs,
                      sx: {
                        '& .MuiChip-root': {
                          color:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main,
                          '&:hover': {
                            color:
                              theme.palette.mode == 'dark'
                                ? theme.palette.customColors.brandYellow
                                : theme.palette.primary.main,
                            backgroundColor:
                              theme.palette.mode === 'dark'
                                ? theme.palette.secondary.dark
                                : theme.palette.secondary.light
                          }
                        }
                      }
                    },

                    actionBar: {
                      actions: ['cancel', 'accept'],
                      sx: {
                        '& .MuiButton-root': {
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
                        }
                      }
                    }
                  }}
                />
                <Button
                  variant='contained'
                  color='secondary'
                  sx={{ marginRight: 1, marginLeft: 3 }}
                  startIcon={<Icon icon='mdi:plus' />}
                  onClick={handleOpenModal}
                >
                  {getDynamicText(value)}
                </Button>
                <MoreActionsDropdown onDelete={handleDelete} tabValue={value} />
              </Fragment>
            )}
            {value === '2' && (
              <DateTimeRangePicker
                calendars={2}
                closeOnSelect={false}
                value={dateRange}
                defaultValue={[yesterdayRounded, todayRounded]}
                disableFuture
                views={['day', 'hours']}
                timeSteps={{ minutes: 10 }}
                viewRenderers={{ hours: renderDigitalClockTimeView }}
                onChange={newValue => {
                  // console.log('Date range:', newValue)
                  setDateRange(newValue)
                }}
                onAccept={handleOnAccept}
                slotProps={{
                  field: { dateSeparator: 'to' },
                  textField: ({ position }) => ({
                    size: 'small',
                    color: position === 'start' ? 'secondary' : 'secondary',
                    focused: true,
                    InputProps: {
                      endAdornment: <Icon icon='mdi:calendar' />
                    }
                  }),
                  desktopPaper: {
                    style: {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.common.white
                    }
                  },

                  day: {
                    sx: {
                      '& .MuiPickersDay-root': {
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
                        '&:hover': {
                          color:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.light
                        }
                      },
                      '& .MuiPickersDay-root.Mui-selected': {
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white
                      }
                    }
                  },

                  shortcuts: {
                    items: predefinedRangesDayjs,
                    sx: {
                      '& .MuiChip-root': {
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.brandYellow
                            : theme.palette.primary.main,
                        '&:hover': {
                          color:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandYellow
                              : theme.palette.primary.main,
                          backgroundColor:
                            theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light
                        }
                      }
                    }
                  },

                  actionBar: {
                    actions: ['cancel', 'accept'],
                    sx: {
                      '& .MuiButton-root': {
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
                      }
                    }
                  }
                }}
              />
            )}
          </Box>
        </Box>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='assets'>
            {sloTotal == 0 ? (
              <Tab value='1' label={t('SLO')} icon={<Icon icon='mdi:check-decagram' />} iconPosition='start' />
            ) : (
              <Tab
                value='1'
                label={`${t('SLO')} (${sloTotal})`}
                icon={<Icon icon='mdi:check-decagram' />}
                iconPosition='start'
              />
            )}
            <Tab value='2' label={t('SLO Event History')} icon={<Icon icon='mdi:history' />} iconPosition='start' />
          </TabList>
          <TabPanel value='1'>
            <SLOList set_total={setSloTotal} total={sloTotal} dateRange={dateRange} onAccept={onAccept} />
          </TabPanel>
          <TabPanel value='2'>
            <SLOEventHistoryList dateRange={dateRange} onAccept={onAccept} />
          </TabPanel>
        </TabContext>
      </Grid>
      <DynamicDialogForm open={openModal} handleClose={handleCloseModal} tab={value} />
      <ConfirmationDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        tab={value}
      />
    </Grid>
  )
}

SLO.acl = {
  action: 'manage',
  subject: 'slo-page'
}

export default SLO
