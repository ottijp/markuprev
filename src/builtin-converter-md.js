import checkbox from 'markdown-it-checkbox'
import css from './github.css'

const md = require('markdown-it')({
  html: true,
  linkify: true,
})
  .use(checkbox)

export default class BuiltinConverterMd {
  convert(source) {
    const body = md.render(source)
    return `<!DOCTYPE html><html><head><meta charset="UFT-8"><style>${css}</style></head><body><div class="markdown-body">${body}</div></body></html>`
  }
}
