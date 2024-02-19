// ** Third Party Imports
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'

import { v4 as uuidv4 } from 'uuid'

import axios from 'axios'
import https from 'https'
import formData from 'form-data'

export const authOptions = {
  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialsProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      id: 'oscar',
      name: 'OscarAppAuth',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},

      async authorize(credentials) {
        try {
          // Use URLSearchParams to construct x-www-form-urlencoded data
          const params = new URLSearchParams()
          params.append('username', credentials.email) // Make sure to use 'username' as the key if that's what your backend expects
          params.append('password', credentials.password)

          // Create an instance of https.Agent for the request to bypass SSL certificate errors
          const httpsAgent = new https.Agent({
            rejectUnauthorized: false // Remember, this is for development only!
          })

          // Perform the login API call and return the token
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/jwt/login`, params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent
          })

          // Retrieve the current user logged in
          if (response.status === 200 && response.data.access_token) {
            const accessToken = response.data.access_token

            try {
              const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                headers: {
                  accept: 'application/json',
                  Authorization: `Bearer ${accessToken}`
                },
                httpsAgent
              })

              if (userResponse.status === 200) {
                const userWithToken = {
                  ...userResponse.data,
                  access_token: accessToken,
                  token_type: response.data.token_type
                }

                // console.log(userWithToken) // Process user details

                return userWithToken
              }
            } catch (error) {
              console.error('Failed to fetch user details:', error)
            }
          }
        } catch (error) {
          console.error('Authorize error:', error)
          throw new Error('NextAuth - Authorize: Auth Error')
        }
      }
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/404'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user, session }) {
      // console.log('JWT Callback', { token, user, session })
      if (user) {
        // Extract API token from the response
        const apiToken = user.access_token

        // Add API token to JWT
        const updatedToken = {
          ...token,
          apiToken,
          role: user.is_superuser ? 'admin' : 'user',
          name: user.first_name + ' ' + user.last_name,
          username: user.username
        }

        // Log the updated token object
        // console.log('Updated Token', updatedToken)

        // Return the updated token object
        return updatedToken
      }

      return token
    },
    async session({ session, token, user }) {
      // console.log('Session Callback', { session, token, user })
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        const updatedSession = {
          ...session,
          user: {
            ...session.user,
            role: token.role,
            username: token.username,
            apiToken: token.apiToken
          },
          sessionID: uuidv4()
        }

        // Log the updated session object
        // console.log('Updated Session', updatedSession)

        // Return the updated session object
        return updatedSession
      }

      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
