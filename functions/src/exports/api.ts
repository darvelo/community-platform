/************ GET and POST requests ************************************************
Redirect requests so that if a custom endpoint function exists we can call them
at /api/[endpoint]
As most functions are called from triggers the api is mostly just used for testing
************************************************************************************/

import * as functions from 'firebase-functions'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as express from 'express'
import { upgradeV2DB } from '../upgrade/dbv2Upgrade'
import { BackupDatabase } from '../Firebase/databaseBackup'
import { fixV2User } from '../upgrade/dbv2UserFix'

console.log('api ready')
const app = express()
// use bodyparse to create json object from body
app.use(
  bodyParser.json({
    limit: '1mb',
  }),
)
// use cors
const corsOptions: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: true,
  preflightContinue: false,
}
// configure app to use cors by default
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: false }))
app.all('*', async (req, res, next) => {
  // get the endpoint based on the request path
  const endpoint = req.path.split('/')[1]
  // *** NOTE currently all request types handled the same, i.e. GET/POST
  // will likely change behaviour in future when required
  switch (endpoint) {
    case 'dbBackup':
      const status = await BackupDatabase()
      return res.send(status)
    case 'dbV2Upgrade':
      const upgradeStatus = await upgradeV2DB()
      return res.send(upgradeStatus)
    case 'v2UserFix':
      const fix = await fixV2User(req.query.user)
      return res.send(fix)
    default:
      res.send('invalid api endpoint')
  }
})

export const api = functions.https.onRequest(app)
