import request from 'request'
import _ from 'lodash'
require('dotenv').config()

import User from '../models/User'
import * as articles from '../articles'
import { Card, ArticleCard, quick_replies } from '../messages'
import * as actions from '../actions'

// textMessage('1390020781029045', 'sup d00d')

function _send(messageData) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.FB_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, function(error, response, body) {
    if (error) {
      console.error('Error sending messages: ', error)
      console.error('============')
    } else if (response.body.error) {
      console.error('Error sending messages: ', response.body.error)
      console.error(messageData)
      console.error('============')
    }
  })
}

export async function cardsMessage(recipientId, cards) {
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

export async function textMessage(recipientId, text) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      text: text,
      quick_replies
    }
  }
  _send(messageData)
}

export async function dailyMessage(recipientId) {
  try {

    let cards = []
    const messageData = {
      recipient: { id: recipientId },
      message: {
        quick_replies,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: []
          }
        }
      }
    }

    const data = await articles.getHomeArticles()
    data.map((article, index) => {

      // Only grab headline articles
      if (index === 0 ||
          index === 3 ||
          index === 8 ) {
        let card = new ArticleCard(article)
        card.button('web_url', 'View Article', article.url)
        cards.push(card)
      }
    })

    messageData.message.attachment.payload.elements = cards
    _send(messageData)

} catch (err) {
    console.error('ERROR in SEND in dailyMessage(): ', err)
    console.error('============')
  }
}

export async function tagMessage(recipientId, tag) {
  try {

    let cards = []
    const messageData = {
      recipient: { id: recipientId },
      message: {
        quick_replies,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: []
          }
        }
      }
    }

    const data = await articles.getTagArticles(tag)
    data.map((article, index) => {
      if (index < 5) {
        let card = new ArticleCard(article)
        card.button('web_url', 'View Article', article.url)
        cards.push(card)
      }
    })

    messageData.message.attachment.payload.elements = cards
    _send(messageData)

  } catch (err) {
    console.error('ERROR in SEND in tagMessage(): ', err)
    console.error('============')
  }
}

export async function featuredMessage(recipientId) {
  try {

    let cards = []
    const messageData = {
      recipient: { id: recipientId },
      message: {
        quick_replies,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: []
          }
        }
      }
    }

    const data = await articles.getHomeArticles()
    data.map((article, index) => {
      if (index < 3) {
        let card = new ArticleCard(article)
        card.button('web_url', 'View Article', article.url)
        cards.push(card)
      }
    })

    messageData.message.attachment.payload.elements = cards
    _send(messageData)

  } catch (err) {
    console.error('ERROR in SEND in featuredMessage(): ', err)
    console.error('============')
  }
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
