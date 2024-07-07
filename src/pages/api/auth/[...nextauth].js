// ** Third Party Imports
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import KeycloakProvider from 'next-auth/providers/keycloak'
import jwt_decode from "jwt-decode";
import { encrypt } from "src/lib/utils";

import { v4 as uuidv4 } from 'uuid'

import axios from 'axios'
import https from 'https'

// Add logging for environment variables
console.log('KEYCLOAK_CLIENT_ID:', process.env.KEYCLOAK_CLIENT_ID)
console.log('KEYCLOAK_CLIENT_SECRET:', process.env.KEYCLOAK_CLIENT_SECRET)
console.log('KEYCLOAK_ISSUER:', process.env.KEYCLOAK_ISSUER)
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET)
console.log('NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED)
console.log('NEXTAUTH_URL', process.env.NEXTAUTH_URL)


// this will refresh an expired access token, when needed
async function refreshAccessToken(token) {
  try {
    const resp = await fetch(`${process.env.REFRESH_TOKEN_URL}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
      }),
      method: "POST",
    });
    const refreshToken = await resp.json();
    if (!resp.ok) throw refreshToken;

    return {
      ...token,
      access_token: refreshToken.access_token,
      decoded: jwt_decode(refreshToken.access_token),
      id_token: refreshToken.id_token,
      expires_at: Math.floor(Date.now() / 1000) + refreshToken.expires_in,
      refresh_token: refreshToken.refresh_token,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // This bypasses SSL certificate validation (use only in development)
})

export const authOptions = {
  providers: [
    /*
    CredentialsProvider({
      id: 'oscar',
      name: 'OscarAppAuth',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        try {
          const params = new URLSearchParams()
          params.append('username', credentials.email)
          params.append('password', credentials.password)

          const httpsAgent = new https.Agent({
            rejectUnauthorized: false // Remember, this is for development only!
          })

          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/jwt/login`, params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent
          })

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
    }),*/

    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
      httpOptions: {
        agent: httpsAgent,
        timeout: 10000 // Increase the timeout to 10 seconds
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/404'
  },

  callbacks: {
    async jwt({ token, account, user, profile }) {
      const nowTimeStamp = Math.floor(Date.now() / 1000);

      console.log('JWT Callback: token', token)
      console.log('JWT Callback: user', user)
      console.log('JWT Callback: account', account)

      if (account && user) {
        // account is only available the first time this callback is called on a new session (after the user signs in)
        const apiToken = account.access_token
        token.decoded = jwt_decode(account.access_token);
        token.access_token = account.access_token;
        token.id_token = account.id_token;
        token.expires_at = account.expires_at;
        token.refresh_token = account.refresh_token;

        const updatedToken = {
          ...token,
          apiToken, 
          role: token.decoded?.realm_access?.roles.includes('admin') ? 'admin' : 'admin',
          name: user?.name ?? 'Default',
          firstName: token.decoded?.given_name ?? 'Default First Name',
          lastName: token.decoded?.family_name ?? 'Default Last Name',
          username: token.decoded?.preferred_username ?? 'Default Username',
          organization: user?.organization ?? 'Default Organization',
          timezone: user?.timezone ?? 'UTC',
        };

        console.log("JWT Callback: roles for user", token.decoded.realm_access.roles)
        console.log('JWT Callback: updated token with account', updatedToken)
        return updatedToken;
      } else if (nowTimeStamp < token.expires_at) {
        console.log('JWT Callback: returning existing token', token)
        return token;
        // token has not expired yet, return it
        return token;
      } else {
        // token is expired, try to refresh it
        console.log("Token has expired. Will refresh...")
        try {
          const refreshedToken = await refreshAccessToken(token);
          console.log("Token is refreshed.")
          return refreshedToken;
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
    },
    
    async session({ session, token }) {
      //console.log('Session Callback: session', session)
      console.log('Session Callback: token', token)
      // Send properties to the client
      //session.access_token = encrypt(token.access_token); // see utils/sessionTokenAccessor.js
      //session.id_token = encrypt(token.id_token);  // see utils/sessionTokenAccessor.js
      session.access_token = token.access_token; // see utils/sessionTokenAccessor.js
      session.id_token = token.id_token;  // see utils/sessionTokenAccessor.js
      session.roles = token.decoded.realm_access.roles;
      session.error = token.error; 
      session.refresh_token = token.refresh_token;
      
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          role: token.role,
          username: token.username,
          apiToken: token.apiToken,
          firstName: token.firstName,
          lastName: token.lastName,
          organization: token.organization,
          timezone: token.timezone,
          jwt: token,
        },
        sessionID: uuidv4(),
      }
      console.log('Session Callback: updated session', updatedSession)

      return updatedSession;
    }
  },


/*
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        const apiToken = account.access_token
        token.decoded = jwt_decode(account.access_token);
        token.access_token = account.access_token;
        token.id_token = account.id_token;
        token.expires_at = account.expires_at;
        token.refresh_token = account.refresh_token;

        const updatedToken = {
          ...token,
          apiToken,
          role: user.is_superuser ? 'admin' : 'admin',
          name: user.first_name + ' ' + user.last_name,
          firstName: user.first_name,
          lastName: user.last_name,
          organization: user.organization,
          timezone: user.timezone,
          username: user.username,
        }

        return updatedToken
      }

      return token
    },
    async session({ session, token }) {
      session.access_token = token.access_token; // see utils/sessionTokenAccessor.js
      session.id_token = token.id_token;  // see utils/sessionTokenAccessor.js
      session.roles = token.decoded.realm_access.roles;
      session.error = token.error;

      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          //role: token.role,
          username: token.username,
          apiToken: token.apiToken,
          firstName: token.firstName,
          lastName: token.lastName,
          organization: token.organization,
          timezone: token.timezone,
          jwt: token,
        },
        sessionID: uuidv4(),
      }

      return updatedSession
    }
  },*/

  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
