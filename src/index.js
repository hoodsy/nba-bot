'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import request from 'request'
import schedule from 'node-schedule'

import { handleWebhookPost, handleWebhookGet } from './api/receive'
import { dbConnect } from './config/db'
import { sendDailySubscription } from './api/subscribe'

const app = express()
app.set('port', (process.env.PORT || 4000))

dbConnect(app)

schedule.scheduleJob('0 30 12 * * *', sendDailySubscription)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', handleWebhookGet)
app.post('/webhook/', handleWebhookPost)

// spin spin sugar
app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'))
})
