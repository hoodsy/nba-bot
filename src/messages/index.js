import _ from 'lodash'

export class Card {
  constructor(props) {
    this.title = props.title || null
    this.image_url = this.formatImageUrl(props.image_url) || null
    this.item_url = props.item_url || null
    this.subtitle = props.subtitle || null
    this.buttons = props.buttons || []
  }

  button(type, title, data) {
    if (type === 'web_url') {
      this.buttons.unshift({
        type,
        title,
        url: data
      })
    }
    else if (type === 'postback') {
      this.buttons.unshift({
        type,
        title,
        payload: data
      })
    }
    else if (type === 'element_share') {
      this.buttons.unshift({
        type
      })
    }
  }

  formatImageUrl(image_url) {
    if (image_url && image_url[0] == '/') {
      return `https://impressiv.io${image_url}`
    }
    else {
      return image_url
    }
  }
}

export class ArticleCard extends Card {
  constructor(article) {
    super({
      title: article.title,
      item_url: article.url,
      image_url: article.image_url,
      subtitle: formatArticleMeta(article.meta),
      buttons: [ { type: 'element_share' } ]
    })
  }
}

// Remove whitespace / newlines
function formatArticleMeta(meta) {
  return meta.replace(/\s+/g, ' ').substring(1)
}

// ICON IMAGES ON S3
const tags = [ 'Featured', 'Politics', 'NBA' ]
export const quick_replies = tags.map(tag => ({
  content_type: 'text',
  title: tag,
  payload: `GET_${tag.toUpperCase()}_ARTICLES`,
  image_url: `https://s3.amazonaws.com/impressiv/icon-${tag.toLowerCase()}-alternate.png`
}))
