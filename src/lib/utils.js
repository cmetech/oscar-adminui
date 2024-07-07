import Cryptr from "cryptr";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export function capitalizeWords(str) {
  if (!str) return ''

  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Utility function to validate UUID format
export function validateUUID(uuid) {
  const regexExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

  return regexExp.test(uuid)
}

export const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

// Utility function to get a value from a nested object given a path like 'networkInterfaces.ipaddress'
// Utility function to get a value from a nested object or list given a path like 'network_interfaces.ip_address'
export const getNestedValue = (obj, path) => {
  const keys = path.split('.')

  return keys.reduce((current, key) => {
    if (Array.isArray(current)) {
      // If the current field is an array, search each object within it
      return current
        .map(item => item[key])
        .filter(value => value !== undefined && value !== null)
        .join(', ') // Combine all found values into a single string (for search purposes)
    }

    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

export function encrypt(text) {
  const secretKey = process.env.NEXTAUTH_SECRET;
  const cryptr = new Cryptr(secretKey);

  const encryptedString = cryptr.encrypt(text);
  return encryptedString; 
}

export function decrypt(encryptedString) {
    const secretKey = process.env.NEXTAUTH_SECRET;
    const cryptr = new Cryptr(secretKey);
  
    const text = cryptr.decrypt(encryptedString);
    return text;
  }

  
export async function keycloakSessionLogOut() {
  try {
    await fetch(`/api/auth/logout`, { method: "GET" });
  } catch (err) {
    console.error(err);
  }
}
/*
export async function keycloakSessionLogOut() {
  try {
    await fetch(`/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Logout failed:", err);
  }
}*/


/*
export async function getAccessToken() {

  const session = await getServerSession(authOptions);  
  if(session){    
    const accessTokenDecrypted = decrypt(session.access_token)    
    console.log("decrypted Access token = %s",accessTokenDecrypted)
    return accessTokenDecrypted;
  }
  return null;
}

export async function getIdToken() {

  const session = await getServerSession(authOptions);  
  if(session){    
    const idTokenDecrypted = decrypt(session.id_token)  
    console.log("decrypted Id token = %s",idTokenDecrypted)  
    return idTokenDecrypted;
  }
  return null;
}
*/

export async function getAccessToken(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (session) {
      //const accessTokenDecrypted = decrypt(session.access_token);
      const accessTokenDecrypted = session.access_token;
      console.log("decrypted Access token = %s", accessTokenDecrypted);
      return accessTokenDecrypted;
    }
  } catch (err) {
    console.error('Error getting access token:', err);
  }
  return null;
}

export async function getIdToken(session) {
  try {
    //const session = await getServerSession(req, res, authOptions);
    if (session) {
      //const idTokenDecrypted = decrypt(session.id_token);
      const idTokenDecrypted = session.id_token;
      console.log("un-decrypted Id token = %s", idTokenDecrypted);
      return idTokenDecrypted;
    }
  } catch (err) {
    console.error('Error getting ID token:', err);
  }
  return null;
}