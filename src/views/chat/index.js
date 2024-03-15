import React, { useState, useEffect } from 'react'
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react'
import axios from 'axios'
import { styled, useTheme } from '@mui/material/styles'

function ChatBot() {
  const [messages, setMessages] = useState([])

  const theme = useTheme()

  useEffect(() => {
    // Toggle the data-theme attribute based on the MUI theme mode
    document.documentElement.setAttribute('data-theme', theme.palette.mode)
  }, [theme.palette.mode])

  const sendMessage = async text => {
    const messageId = Math.random().toString(36).substring(7) // Simple random ID generator
    setMessages([...messages, { direction: 'outgoing', text, id: messageId }])

    try {
      const response = await axios.post('/api/oscar/chat', { message: text })
      setMessages(messages => [
        ...messages,
        { direction: 'incoming', text: response.data.reply, id: messageId + '_reply' }
      ])
    } catch (error) {
      console.error('Failed to send message: ', error)
    }
  }

  return (
    <div style={{ position: 'relative', height: '800px' }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map(msg => (
              <Message
                key={msg.id}
                model={{
                  message: msg.text,
                  direction: msg.direction
                }}
              />
            ))}
          </MessageList>
          <MessageInput
            attachButton={false}
            autoFocus
            placeholder='Type message here'
            onSend={sendMessage}
            className='custom-message-input'
          />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

export default ChatBot
