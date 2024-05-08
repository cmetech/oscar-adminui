import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'
import { useAtom } from 'jotai'
import { showOscarChatAtom } from 'src/lib/atoms'
import ChatBot from 'src/views/chat'

// Define the responsive Box using styled
const ResponsiveBox = styled(Box)(({ theme }) => ({
  width: '100%', // Default width
  height: '100%', // Default height
  maxWidth: '1000px', // Default max width
  mx: 'auto', // Center the box
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%' // Slightly less than full width for sm devices
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '75%' // Use more space on md devices, but not full width
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '1000px' // Limit maxWidth for lg and xl devices
  }

  // Add more responsive styles if needed
}))

const OscarChatSideBar = () => {
  const theme = useTheme()
  const [showOscarChat, setShowOscarChat] = useAtom(showOscarChatAtom)

  const handleClose = () => setShowOscarChat(false)

  return (
    <Drawer
      anchor='right'
      open={showOscarChat}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          minWidth: 700,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.customColors.brandBlack
              : theme.palette.customColors.brandWhite
        }
      }}
    >
      <ResponsiveBox>
        <ChatBot />
      </ResponsiveBox>
    </Drawer>
  )
}

export default OscarChatSideBar
