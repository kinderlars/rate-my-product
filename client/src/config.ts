const apiId = '5gyfg8j8o7'
const region = 'eu-central-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-lb67h78z.eu.auth0.com',            // Auth0 domain
  clientId: 'kfkVXwk1Ky0AtAm4ztJosqxUXwf989hN',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
