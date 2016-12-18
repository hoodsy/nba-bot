import User from '../models/User'
import { dailyMessage, textMessage, cardsMessage } from './send'
import Subscription, { DEFAULT_HEADLINE } from '../models/Subscription'

export async function sendDailySubscription() {
  try {

    const subscription = await Subscription.findOne()
    let { cards, headline } = subscription
    if (headline == DEFAULT_HEADLINE) {
      cards = await subscription.getHeadlineCards()
    }

    // If no new articles, no daily message
    if (cards.length == 0) {
      console.log('No new articles to send for subscription.')
      return
    }

    const users = await User.find({ 'subscription.active': true })
    await Promise.all(users.map(async (user) => {
      await textMessage(user.messenger_id, headline)
      await cardsMessage(user.messenger_id, cards)
    }))

    await subscription.logHeadline(headline, cards)

  } catch (err) {
    console.error('error in SUBSCRIBE in sendDailySubscription(): ', err)
    console.error('============')
  }
}

export async function subscribe(messenger_id) {
  try {

    await User.update(
      { messenger_id },
      { $set: { 'subscription.active': true } }
    )

  } catch (err) {
    console.error('ERROR in SUBSCRIBE in subscribe()', err)
    console.error('================')
  }
}

export async function unsubscribe(messenger_id) {
  try {

    await User.update(
      { messenger_id },
      { $set: { 'subscription.active': false } }
    )

  } catch (err) {
    console.error('ERROR in SUBSCRIBE in unsubscribe()', err)
    console.error('================')
  }
}
