import React, { useState, useEffect, useCallback } from 'react'
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
import { set } from 'nprogress'

const CustomTypingIndicator = ({ userIsTyping, oscarIsTyping, userName }) => {
  if (userIsTyping && oscarIsTyping) {
    return <TypingIndicator content='Both are typing...' className='custom-typing-indicator' />
  } else if (userIsTyping) {
    return <TypingIndicator content={`${userName} is typing...`} className='custom-typing-indicator' />
  } else if (oscarIsTyping) {
    return <TypingIndicator content='OSCAR is typing...' className='custom-typing-indicator' />
  }

  return null
}

const ChatBot = () => {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [oscarIsTyping, setOscarIsTyping] = useState(false)

  const theme = useTheme()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'John Doe'
  const firstName = userName.split(' ')[0]
  const imageFileName = userName.toLowerCase().replace(/\s+/g, '') || '1'

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
  }

  const sendMessage = async text => {
    setIsTyping(false)

    const messageId = Math.random().toString(36).substring(7) // Simple random ID generator
    setMessages([...messages, { direction: 'outgoing', text, id: messageId }])
    setOscarIsTyping(true)

    try {
      const response = await axios.post('/api/oscar/chat', { message: text })
      setMessages(messages => [
        ...messages,
        { direction: 'incoming', text: response.data.reply, id: messageId + '_reply' }
      ])
      setOscarIsTyping(false)
    } catch (error) {
      console.error('Failed to send message: ', error)
      setOscarIsTyping(false)
    }
  }

  return (
    <div style={{ position: 'relative', height: '1000px' }}>
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <Avatar src='/images/oscar.png' name='Oscar' status='available' />
            <ConversationHeader.Content userName='OSCAR' info='ChatBot' />
            <ConversationHeader.Actions>
              <IconButton onClick={clearChat} title='Clear chat' color='error' size='medium'>
                <Icon icon='mdi:trash-can' />
              </IconButton>
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageSeparator as='h2' content='Monday, 23 December 2019' />
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
                  direction: msg.direction
                }}
              >
                <Avatar
                  src={msg.direction === 'incoming' ? '/images/oscar.png' : `/images/avatars/${imageFileName}.png`}
                  name={msg.direction === 'incoming' ? 'Oscar' : 'You'}
                  status={msg.direction === 'incoming' ? 'available' : 'available'}
                />
              </Message>
            ))}
          </MessageList>
          <MessageInput
            attachButton={false}
            autoFocus
            placeholder='Message OSCAR...'
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
