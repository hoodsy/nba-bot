import User from '../models/User'
import { textMessage, cardsMessage } from './send'

export async function sendDailySubscription() {
  try {

    const users = await User.find({ 'subscription.active': true })
    await Promise.all(users.map(async (user) => {
      // await textMessage(user.messenger_id, headline)
      // await cardsMessage(user.messenger_id, cards)
    }))

  } catch (err) {
    console.error('error in SUBSCRIBE in sendDailySubscription(): ', err)
    console.error('============')
  }
}
