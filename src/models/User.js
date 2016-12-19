import mongoose, { Schema } from 'mongoose'
import request from 'request-promise'

const UserSchema = new Schema({
  messenger_id: { type: String, index: 1 },
  subscription: {
    active: { type: Boolean, default: true }
  },
  profiles: {
    messenger: { type: Object }
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

UserSchema.statics.createUnique = async function(messenger_id) {
  try {

    if (!await this.exists(messenger_id)) {
      const profile = await request({
        url: `https://graph.facebook.com/v2.6/${messenger_id}`,
        qs: {
          access_token: process.env.FB_PAGE_ACCESS_TOKEN,
          fields: 'first_name,last_name,profile_pic,locale,timezone,gender,is_payment_enabled'
        },
        method: 'GET'
      })

      await new this({
        messenger_id,
        profiles: {
          messenger: JSON.parse(profile)
        }
      }).save()
    }

  } catch (err) {
    console.error('ERROR in model USER static createUnique(): ', err)
    console.error('============')
  }
}

UserSchema.statics.exists = async function (messenger_id) {
  try {

    const count = await this.count({ messenger_id })
    return count > 0

  } catch (err) {
    console.error('ERROR in model USER static exists(): ', err)
  }
}

UserSchema.statics.subscribe = async function (messenger_id) {
  try {

    await this.update(
      { messenger_id },
      { $set: { 'subscription.active': true } }
    )

  } catch (err) {
    console.error('ERROR in model USER static subscribe(): ', err)
  }
}

UserSchema.statics.unsubscribe = async function (messenger_id) {
  try {

    await this.update(
      { messenger_id },
      { $set: { 'subscription.active': false } }
    )

  } catch (err) {
    console.error('ERROR in model USER static unsubscribe(): ', err)
  }
}

export default mongoose.model('User', UserSchema)
