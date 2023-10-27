// ** Third Party Imports
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

import axios from 'axios'
import formData from 'form-data'

/*
 * As we do not have backend server, the refresh token feature has not been incorporated into the template.
 * Please refer https://next-auth.js.org/tutorials/refresh-token-rotation link for a reference.
 */
const users = [
  {
    id: 1,
    role: 'admin',
    password: 'admin',
    username: 'ecorell',
    fullName: 'Corey Ellis',
    email: 'corey.ellis@ericsson.com'
  },
  {
    id: 2,
    role: 'client',
    password: 'guest',
    username: 'guest',
    fullName: 'John Doe',
    email: 'guest@ericsson.com'
  },
  {
    id: 3,
    role: 'admin',
    password: 'admin',
    username: 'ekargaj',
    fullName: 'Kartik Gajjar',
    email: 'kartik.gajjar@ericsson.com'
  },
  {
    id: 4,
    role: 'admin',
    password: 'admin',
    username: 'erupnag',
    fullName: 'Rupesh Nagar',
    email: 'rupesh.nagar@ericsson.com'
  },
  {
    id: 5,
    role: 'admin',
    password: 'admin',
    username: 'adminuser',
    fullName: 'Admin User',
    email: 'admin@ericsson.com'
  }
]

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
        const { email, password } = credentials

        if (process.env.STUB === 'true') {
          /*
           * You need to provide your own logic here that takes the credentials submitted and returns either
           * an object representing a user or value that is false/null if the credentials are invalid.
           * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
           * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
           */

          try {
            // ** Login API Call to match the user credentials and receive user data in response along with his role
            const user = users.find(u => u.email === email && u.password === password)

            if (user) {
              /*
               * Please unset all the sensitive information of the user either from API response or before returning
               * user data below. Below return statement will set the user object in the token and the same is set in
               * the session which will be accessible all over the app.
               */
              return user
            }

            throw new Error('Email or Password is Invalid')
          } catch {
            throw new Error('NextAuth - Authorize: Auth Error')
          }
        } else {
          const prisma = new PrismaClient()

          try {
            // Query user by email
            const user = await prisma.oAUsers.findUnique({
              where: {
                email: email
              }
            })

            if (!user) {
              throw new Error('No user found')
            }

            // Check if user is active
            if (user.is_active === 0) {
              throw new Error('User is deactivated')
            }

            // Compare hashed password
            const isValid = await bcrypt.compare(password, user.hashed_password)

            if (!isValid) {
              throw new Error('Invalid password')
            }

            // Remove sensitive hashed_password field
            const { hashed_password, ...safeUser } = user

            // Add fullName to the user object
            safeUser.fullName = `${safeUser.first_name} ${safeUser.last_name}`

            // Add role based on is_superuser
            safeUser.role = safeUser.is_superuser ? 'admin' : 'regular'

            // Add password to the user object
            safeUser.password = password

            console.log('User:', safeUser)

            return safeUser
          } catch (error) {
            console.error('Authorize error:', error)
            throw new Error('NextAuth - Authorize: Auth Error')
          }
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
      console.log('JWT Callback', { token, user, session })
      if (user) {
        // Prepare form data for API call
        const formData = new FormData()
        formData.append('username', user.email) // Assuming you have username in the user object
        formData.append('password', user.password) // CAUTION: Storing password in JWT is not recommended

        try {
          // Make API call to get API token
          const response = await axios({
            method: 'post',
            url: `${process.env.OAPI_URL}/auth/jwt/login`,
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })

          // Extract API token from the response
          const apiToken = response.data.access_token // Specific to your API's response structure

          // Add API token to JWT
          const updatedToken = {
            ...token,
            apiToken,
            role: user.role,
            fullName: user.fullName,
            username: user.username
          }

          // Log the updated token object
          console.log('Updated Token', updatedToken)

          // Return the updated token object
          return updatedToken
        } catch (error) {
          console.error('Error fetching API token:', error)

          // Handle error as needed
          return token
        }
      }

      return token
    },
    async session({ session, token, user }) {
      console.log('Session Callback', { session, token, user })
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        const updatedSession = {
          ...session,
          user: {
            ...session.user,
            role: token.role,
            fullName: token.fullName,
            username: token.username,
            apiToken: token.apiToken
          },
          sessionID: uuidv4()
        }

        // Log the updated session object
        console.log('Updated Session', updatedSession)

        // Return the updated session object
        return updatedSession
      }

      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
