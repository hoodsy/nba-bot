import Promise from 'bluebird'
const x = require('x-ray')()

import { ArticleCard } from '../messages'

export function getHomeArticles() {
  const url = 'https://impressiv.io'
  return new Promise((resolve, reject) => {
    x(url, '.post-container', [{
      title: '.post-meta .post-title',
      url: 'a@href',
      image_url: '.post-image-url',
      meta: '.post-meta .post-author-date',
      tag: '.tag-name'
    }])
    ((err, data) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(data)
      }
    })
  })
}

export function getTagArticles(tag) {
  const url = `https://impressiv.io/tag/${tag}`
  return new Promise((resolve, reject) => {
    x(url, '.post-container', [{
      title: '.post-meta .post-title',
      url: 'a@href',
      image_url: '.post-image-url',
      meta: '.post-meta .post-author-date',
    }])((err, data) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(data)
      }
    })
  })
}

export async function getFeaturedCards() {
  try {

    const cards = []
    const articles = await getHomeArticles()
    articles.map((article, index) => {
      if (index < 3) {
        let card = new ArticleCard(article)
        card.button('web_url', 'View Article', article.url)
        cards.push(card)
      }
    })

    return cards

  } catch (err) {
    console.error('ERROR in ARTICLES in getFeaturedCards(): ', err)
    console.error('============')
  }
}
