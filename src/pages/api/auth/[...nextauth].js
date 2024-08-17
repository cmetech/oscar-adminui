// ** Third Party Imports
import NextAuth from 'next-auth'
import { jwtDecode } from 'jwt-decode'
import CredentialsProvider from 'next-auth/providers/credentials'
import KeycloakProvider from 'next-auth/providers/keycloak'

import axios from 'axios'
import https from 'https'

async function refreshAccessToken(token) {
  try {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await axios.post(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent,
        timeout: 10000
      }
    );

    const refreshedTokens = response.data;
    console.log('Refreshed Tokens:', refreshedTokens);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in ?? 0) * 1000,
      error: undefined, // Clear any previous errors
    };
  } catch (error) {
    console.error('RefreshAccessTokenError', error);
    return {
      ...token,
      error: error.response?.data?.error || 'RefreshAccessTokenError',
    };
  }
}

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
    }),

    // ** ...add more providers here
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: { scope: "openid email profile roles" }
      },
      httpOptions: {
        agent: new https.Agent({
          rejectUnauthorized: false
        }),
        timeout: 10000
      }
    })
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
    async jwt({ token, user, account, profile }) {
      const nowTimeStamp = Math.floor(Date.now() / 1000);

      console.log('JWT Callback: token', token)
      console.log('JWT Callback: user', user)
      console.log('JWT Callback: account', account)
      console.log('JWT Callback: profile', profile)

      if (account && user) {
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds
        const nowInSeconds = Math.floor(Date.now() / 1000);

        if (account.provider === 'oscar') {
          // Oscar Auth
          const roles = user.is_superuser ? ['admin'] : ['regular'];
          const updatedToken = {
            ...token,
            sub: token.sub,
            roles: roles,
            name: user.first_name + ' ' + user.last_name,
            firstName: user.first_name,
            lastName: user.last_name,
            organization: user.organization,
            timezone: user.timezone,
            username: user.username,
            accessToken: user.access_token,
            expires_at: nowInSeconds + thirtyDaysInSeconds, // Set expiration to 30 days from now
            provider: account.provider,
          }

          console.log('Oscar Auth: updatedToken', updatedToken)
          return updatedToken

        } else if (account.provider === 'keycloak') {
          // Use jwt-decode to decode the access token
          const decodedToken = jwtDecode(account.access_token);

          console.log('Decoded Token:', decodedToken);
          const client_id = profile.aud

          console.log('Decoded Token:', decodedToken);
          console.log('Client ID:', client_id);

          // Extract the roles from the decoded token
          const roles = decodedToken?.resource_access?.[client_id]?.roles || [];
          console.log('Roles:', roles);

          // Keycloak Auth
          const updatedToken = {
            ...token,
            sub: token.sub,
            firstName: profile.given_name,
            lastName: profile.family_name,
            organization: profile.organization ? 'ericsson' : 'ericsson',
            timezone: profile.zoneinfo ? profile.zoneinfo : 'America/New_York',
            username: profile.preferred_username,
            idToken: account.id_token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expires_at: account.expires_at,
            refreshTokenExpires: account.refresh_token_expires_in,
            provider: account.provider,
            roles: roles,
          }

          console.log('Keycloak Auth: updatedToken', updatedToken)
          return updatedToken
        }
      } else {
        if (token.provider === 'keycloak') {
          if (token.expires_at && token.expires_at - nowTimeStamp < 60) {
            console.log('Token is about to expire. Refreshing...')
            return refreshAccessToken(token)
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      console.log('Session Callback: session', session)
      console.log('Session Callback: token', token)

      session.user = {
        id: token.sub,
        name: token.name,
        roles: token.roles,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        organization: token.organization,
        timezone: token.timezone,
        username: token.username,
      }
      session.accessToken = token.accessToken
      session.provider = token.provider
      session.error = token.error
      session.expires_at = token.expires_at

      // Add idToken if the provider is Keycloak
      if (token.provider === 'keycloak') {
        session.idToken = token.idToken
        session.refreshToken = token.refreshToken
      }

      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
