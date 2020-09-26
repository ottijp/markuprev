import checkbox from 'markdown-it-checkbox'
import fs from 'fs'
import path from 'path'
import util from 'util'

const md = require('markdown-it')({
  html: true,
  linkify: true,
})
  .use(checkbox)

export default class BuiltinConverterMd {
  // ignore because this method is protocol
  /* eslint class-methods-use-this: 0 */
  async convert(source) {
    const css = await util.promisify(fs.readFile)(path.join(__static, 'github.css'))
    const body = md.render(source)
    return `<!DOCTYPE html><html><head><meta charset="UFT-8"><style>${css}</style></head><body><div class="markdown-body">${body}</div></body></html>`
  }
}
