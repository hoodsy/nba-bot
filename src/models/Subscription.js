import mongoose, { Schema } from 'mongoose'
import request from 'request-promise'
import _ from 'lodash'

export const DEFAULT_HEADLINE = 'Here\'s today\'s latest in Politics and the NBA!'

const SubscriptionSchema = new Schema({
  headline: { type: String, index: 1, default: DEFAULT_HEADLINE },
  cards: { type: Object },
  log: { type: [] }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

SubscriptionSchema.methods.setHeadline = async function (headline, cards) {
  try {

    await this.constructor.update(
      { _id: this._id },
      {
        $set: {
          headline: headline.trim(),
          cards: cards
        }
      }
    )

  } catch (err) {
    console.error('ERROR in Subscription in setHeadline()', err)
    console.error('============')
  }
}

// SubscriptionSchema.methods.getHeadlineCards = async function () {
//   try {
//
//     let oldCards = [ { title: '' } ]
//     if (this.log.length > 0) {
//       oldCards = this.log.pop()
//       oldCards = oldCards.cards
//     }
//
//     const newCards = await getFeaturedCards()
//     const cards = newCards.filter(card =>
//       !oldCards.some(oldCard =>
//         oldCard.title == card.title
//       )
//     )
//
//     return cards
//
//   } catch (err) {
//     console.error('ERROR in Subscription in setHeadline()', err)
//     console.error('============')
//   }
// }

SubscriptionSchema.methods.logHeadline = async function (headline, cards) {
  try {

    await this.constructor.update(
      { _id: this._id },
      {
        $push: {
          log: {
            headline: headline,
            cards: cards
          }
        }
      }
    )

    await this.constructor.update(
      { _id: this._id },
      {
        $set: {
          headline: DEFAULT_HEADLINE,
          cards: []
        }
      }
    )

  } catch (err) {
    console.error('ERROR in Subscription in logHeadline()', err)
    console.error('============')
  }
}

export default mongoose.model('Subscription', SubscriptionSchema)
