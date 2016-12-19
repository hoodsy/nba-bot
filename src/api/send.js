import request from 'request-promise'
import _ from 'lodash'
require('dotenv').config()

import User from '../models/User'
import { Card, ArticleCard, quick_replies } from '../messages'
import * as actions from '../actions'

//
// Send Message Request
// ---
//
async function _send(messageData) {
  try {

    await request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.FB_PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData
    })

  } catch (err) {
    console.log('ERROR in SEND in _send()', err)
    console.log('============')
  }
}

//
// Message Templates
// ---
//
export function cardsMessage(recipientId, cards) {
  try {

    const messageData = {
      recipient: { id: recipientId },
      message: {
        quick_replies,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: cards
          }
        }
      }
    }
    _send(messageData)

  } catch (err) {
    console.error('ERROR in SEND in cardsMessage()', err)
    console.error('============')
  }
}

export function textMessage(recipientId, text) {

  const messageData = {
    recipient: { id: recipientId },
    message: {
      text: text,
      quick_replies
    }
  }
  _send(messageData)

}

export async function subscriptionMessage(recipientId) {
  try {

    const user = await User.findOne(
      { messenger_id: recipientId },
      { subscription: 1 }
    )

    if (!user) {
      throw new Error(`User with id ${recipientId} doesn't exist.`)
    }

    const card = new Card({
      title: 'Manage Subscription',
      image_url: 'https://s3.amazonaws.com/impressiv/subscription-image.png',
      subtitle: 'Recieve headlines for Politics and the NBA in the morning and evening.'
    })
    if (user.subscription.active) {
      card.button('postback', 'Unsubscribe', actions.UNSUBSCRIBE)
    }
    else {
      card.button('postback', 'Subscribe', actions.SUBSCRIBE)
    }

    const messageData = {
      recipient: { id: recipientId },
      message: {
        quick_replies,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [ card ]
          }
        }
      }
    }
    _send(messageData)

  } catch (err) {
    console.error('ERROR in SEND in subscriptionMessage()', err)
    console.error('================')
  }
}
