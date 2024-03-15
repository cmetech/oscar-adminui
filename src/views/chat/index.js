import React, { useState } from 'react'
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react'
import axios from 'axios'

function ChatBot() {
  const [messages, setMessages] = useState([])

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
    <div style={{ position: 'relative', height: '1000px' }}>
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
          <MessageInput placeholder='Type message here' onSend={sendMessage} />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

export default ChatBot
