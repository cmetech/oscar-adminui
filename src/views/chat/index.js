import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
  Status,
  MessageSeparator,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react'
import axios from 'axios'
import { styled, useTheme } from '@mui/material/styles'
import { useSession } from 'next-auth/react'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import getConfig from 'next/config'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

const CustomTypingIndicator = ({ userIsTyping, oscarIsTyping, userName }) => {
  const { t } = useTranslation()

  if (userIsTyping && oscarIsTyping) {
    return <TypingIndicator content={t('bothTyping', { userName })} className='custom-typing-indicator' />
  } else if (userIsTyping) {
    return <TypingIndicator content={t('userIsTyping', { userName })} className='custom-typing-indicator' />
  } else if (oscarIsTyping) {
    return <TypingIndicator content={t('oscarThinking')} className='custom-typing-indicator' />
  }

  return null
}

const ChatBot = () => {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [oscarIsTyping, setOscarIsTyping] = useState(false)
  const wsRef = useRef(null)
  const [wsReady, setWsReady] = useState(false)
  const { publicRuntimeConfig } = getConfig()

  const { t } = useTranslation()

  // Add a ref to track whether the initial OSCAR message has been sent
  const initialMessageSentRef = useRef(false)

  const theme = useTheme()
  const { data: session } = useSession()

  console.log('session', session)

  const userName = session?.user?.name || 'John Doe'
  const { firstName, lastName, email, timezone } = session.user
  const imageFileName = userName.toLowerCase().replace(/\s+/g, '') || '1'

  const CHAT_MODE = publicRuntimeConfig.CHAT_MODE || 'api'
  console.log('Chat mode:', CHAT_MODE)

  useEffect(() => {
    if (CHAT_MODE === 'websocket') {
      // Establish WebSocket connection
      const wsEndpoint = publicRuntimeConfig.CHAT_WS_ENDPOINT
      console.log('WebSocket endpoint:', wsEndpoint)

      if (!wsEndpoint) {
        console.error('WebSocket endpoint is not defined.')

        return
      }

      const wsUrl = `${wsEndpoint}/api/v1/chat/ws`
      console.log('WebSocket URL:', wsUrl)

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established')
        setWsReady(true)
      }

      wsRef.current.onmessage = event => {
        const message = {
          id: Math.random().toString(36).substring(7),
          text: event.data,
          direction: 'incoming',
          sender: 'ChatBot'
        }
        setMessages(prevMessages => [...prevMessages, message])
        setOscarIsTyping(false)
        console.log('Received message:', message)
      }

      wsRef.current.onclose = event => {
        console.log('WebSocket connection closed', event)
        setWsReady(false)
      }

      wsRef.current.onerror = error => {
        console.error('WebSocket error:', error)
      }

      // Cleanup on component unmount
      return () => {
        if (wsRef.current) {
          wsRef.current.close()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CHAT_MODE])

  useEffect(() => {
    const email = session?.user?.email
    if (email) {
      const storedMessagesKey = `chatMessages_${email}`
      const storedMessages = localStorage.getItem(storedMessagesKey)

      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
        initialMessageSentRef.current = true // Ensure we don't reinitialize OSCAR's message if messages were loaded
      } else {
        initialMessageSentRef.current = false // Ensure OSCAR's message is sent if no messages are loaded
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]) // Dependency on `session` ensures it runs once the session info is available

  useEffect(() => {
    // Only proceed if no messages are present and the initial message hasn't been sent yet
    if (messages.length === 0 && !initialMessageSentRef.current) {
      setOscarIsTyping(true)

      setTimeout(() => {
        const initialMessage = {
          id: Math.random().toString(36).substring(7),
          text: "Hello! I'm OSCAR, your AI assistant. How can I help you today?",
          direction: 'incoming'
        }

        setMessages([initialMessage])
        setOscarIsTyping(false)
        initialMessageSentRef.current = true // Mark that the initial message has been sent
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, initialMessageSentRef.current])

  useEffect(() => {
    if (session && session.user && session.user.email) {
      // Use the user's email as part of the key to ensure user-specific storage
      localStorage.setItem(`chatMessages_${session.user.email}`, JSON.stringify(messages))
    }
  }, [messages, session])

  useEffect(() => {
    // Toggle the data-theme attribute based on the MUI theme mode
    document.documentElement.setAttribute('data-theme', theme.palette.mode)
  }, [theme.palette.mode])

  // Debounce typing indicator reset
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false)
      }, 1000) // Resets isTyping to false after 1 second of inactivity

      return () => clearTimeout(timer)
    }
  }, [isTyping])

  const handleInputChange = useCallback((innerHtml, textContent, innerText, nodes) => {
    setIsTyping(true)

    // Here, you can implement any additional logic needed when the input changes
  }, [])

  const clearChat = () => {
    setMessages([])
    if (session && session.user && session.user.email) {
      localStorage.removeItem(`chatMessages_${session.user.email}`)
    }
    initialMessageSentRef.current = false // Reset the initial message sent flag
  }

  const sendMessage = async text => {
    setIsTyping(false)

    const messageId = Math.random().toString(36).substring(7) // Simple random ID generator
    setMessages([...messages, { direction: 'outgoing', text, id: messageId }])
    setOscarIsTyping(true)

    const userInfo = {
      first_name: session.user.firstName,
      last_name: session.user.lastName,
      email: session.user.email,
      timezone: session.user.timezone
    }

    if (CHAT_MODE === 'websocket') {
      if (wsReady && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(text)
        } catch (error) {
          console.error('Failed to send message over WebSocket:', error)
          setOscarIsTyping(false)
        }
      } else {
        console.error('WebSocket is not open. Unable to send message.')
        setOscarIsTyping(false)
      }
    } else if (CHAT_MODE === 'api') {
      try {
        const response = await axios.post('/api/oscar/chat', {
          message: text,
          ...userInfo
        })

        setMessages(messages => [
          ...messages,
          { direction: 'incoming', text: response.data.reply, id: `${messageId}_reply` }
        ])
        setOscarIsTyping(false)
      } catch (error) {
        console.error('Failed to send message: ', error)

        const errorMessage = {
          direction: 'incoming',
          text: `Sorry ${firstName}, something went wrong.`,
          id: `${messageId}_reply`
        }
        setMessages(prevMessages => [...prevMessages, errorMessage])
        setOscarIsTyping(false)
      }
    }
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <Avatar src='/images/oscar.png' name='Oscar' status='available' />
            <ConversationHeader.Content userName='OSCAR' info='Ericsson Powered ChatBot' />
            <ConversationHeader.Actions>
              <IconButton onClick={clearChat} title={t('clearChat')} color='error' size='medium'>
                <Icon icon='mdi:trash-can' />
              </IconButton>
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList
            typingIndicator={
              <CustomTypingIndicator userIsTyping={isTyping} oscarIsTyping={oscarIsTyping} userName={firstName} />
            }
          >
            {messages.map(msg => (
              <Message
                key={msg.id}
                model={{
                  message: msg.text,
                  sender: msg.direction === 'incoming' ? 'OSCAR' : firstName,
                  sentTime: new Date().toISOString(),
                  direction: msg.direction
                }}
                avatarPosition={msg.direction === 'incoming' ? 'cl' : 'cr'}
              >
                <Avatar
                  src={msg.direction === 'incoming' ? '/images/oscar.png' : `/images/avatars/${imageFileName}.png`}
                  name={msg.direction === 'incoming' ? 'Oscar' : 'You'}
                  status={msg.direction === 'incoming' ? 'available' : 'available'}
                  onError={e => {
                    e.target.onerror = null // Prevent infinite loop
                    e.target.src = '/images/avatars/1.png'
                  }}
                />
              </Message>
            ))}
          </MessageList>
          <MessageInput
            attachButton={false}
            autoFocus
            placeholder={t('Message OSCAR')}
            onSend={sendMessage}
            className='custom-message-input'
            onChange={handleInputChange}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

export default ChatBot
