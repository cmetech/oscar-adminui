import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const keycloakIssuer = process.env.KEYCLOAK_ISSUER;
      const keycloakClientId = process.env.OSCAR_CLIENT_ID;
      const keycloakClientSecret = process.env.OSCAR_CLIENT_SECRET;

      const keycloakLogoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout`;

      const formData = new URLSearchParams();
      formData.append('client_id', keycloakClientId);
      formData.append('client_secret', keycloakClientSecret);
      formData.append('refresh_token', refreshToken);

      const response = await axios.post(keycloakLogoutUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      });

      console.log('Keycloak logout response:', response.data);

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      res.status(500).json({ message: 'Logout failed', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
