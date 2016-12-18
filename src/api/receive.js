import { token } from '../config'
import * as send from '../api/send'
import * as subscribe from '../api/subscribe'
import * as actions from '../actions'
import User from '../models/User'
import Subscription from '../models/Subscription'
import { timeout } from '../util'

//
// Public Routes
// ---
//
export function handleWebhookGet (req, res) {
  if (req.query['hub.verify_token'] === token) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
}

export async function handleWebhookPost (req, res) {
  try {

    let messaging_events = req.body.entry[0].messaging
    if (!messaging_events) {
      return
    }

    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]

      if (event.message && event.message.text && !event.message.is_echo) {
        await handleMessage(event)
      }

      if (event.postback) {
        handlePostback(event)
        continue
      }
    }

    res.sendStatus(200)

  } catch (err) {
    console.error('ERROR in receive handleWebhookPost(): ', err)
  }
}

//
// Post Helpers
// ---
//
// handleMessage({ message: { text: 'Politics' } })
async function handleMessage({ message, sender }) {
  try {
    const text = message.text.toLowerCase()
    if (text.includes('help --admin') || text.includes('help -a')) {

      await send.textMessage(sender.id, 'To set a daily headline, say "set headline"')
      await send.textMessage(sender.id, 'To check the daily headline, say "get headline"')

    }
    else if (text.includes('help')) {

      await send.textMessage(sender.id, 'That\'s what I\'m here for! 😎')
      await send.textMessage(sender.id, 'Select a section below for daily headlines or say "subscription" to manage your settings.')

    }
    else if (text.includes('set headline')) {

      const subscription = await Subscription.findOne({})
      const cards = await subscription.getHeadlineCards()

      await send.textMessage(sender.id, 'Here are today\'s articles:')
      await send.cardsMessage(sender.id, cards)
      await send.textMessage(sender.id, 'Say "new headline: <headline>" to set a new headline for these articles.')

    }
    else if (text.includes('new headline:')) {

      const cmd = 'new headline:'
      const headline = message.text.slice(cmd.length)

      const subscription = await Subscription.findOne({})
      const cards = await subscription.getHeadlineCards()
      await subscription.setHeadline(headline, cards)

    }
    else if (text.includes('get headline')) {

      const subscription = await Subscription.findOne({}, { log: 0 })
      await send.textMessage(sender.id, subscription.headline)
      await send.cardsMessage(sender.id, subscription.cards)

    }
    else if (text.includes('subscription')) {

      await send.subscriptionMessage(sender.id)

    }
    else if (text.includes('politics')) {

      await send.tagMessage(sender.id, 'politics')

    }
    else if (text.includes('nba')) {

      await send.tagMessage(sender.id, 'nba')

    }
    else if (text.includes('featured')) {

      await send.featuredMessage(sender.id)

    }
    else if (message.quick_reply) {

      handleQuickReply(message, sender)

    }
    // else {
    //   send.textMessage(sender.id, "Text received, echo: " + text.substring(0, 200))
    // }
  } catch (err) {
    console.error('ERROR in RECEIVE in handleMessage()', err)
    console.error('============')
  }
}

function handleQuickReply({ quick_reply }, sender) {
  switch(quick_reply.payload) {

    case actions.GET_FEATURED_ARTICLES:
      send.featuredMessage(sender.id)
      return

    case actions.GET_POLITICS_ARTICLES:
      send.tagMessage(sender.id, 'politics')
      return

    case actions.GET_NBA_ARTICLES:
      send.tagMessage(sender.id, 'nba')
      return

    case actions.GET_STARTUPS_ARTICLES:
      send.tagMessage(sender.id, 'startups')
      return

  }
}

async function handlePostback({ postback, sender }) {
  try {

    switch(postback.payload) {

      case actions.START:
        await User.createUnique(sender.id)
        await send.textMessage(sender.id, 'Hey there! 😁 I\'ll bring you Politics and NBA news daily - if you get lost just say "help".')

        await timeout(1000)
        await send.textMessage(sender.id, 'Here are the daily headlines, for your viewing pleasure:')
        await send.dailyMessage(sender.id)
        return

      case actions.GET_DAILY_ARTICLES:
        await send.dailyMessage(sender.id)
        return

      case actions.EDIT_SETTINGS:
        await send.subscriptionMessage(sender.id)
        return

      case actions.SUBSCRIBE:
        await subscribe.subscribe(sender.id)
        await send.textMessage(sender.id, '🙌 Good choice! You\'ll receive daily headlines in the morning and evening.')
        return

      case actions.UNSUBSCRIBE:
        await subscribe.unsubscribe(sender.id)
        await send.textMessage(sender.id, 'It\'s sad to see you go 😿. Feel free to reactivate your subscription whenever you like!')
        return

      default:
        return

    }
  } catch (err) {
    console.error('ERROR in RECEIVE in handlePostback()', err)
    console.error('================')
  }
}
