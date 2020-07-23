import childProcess from 'child_process'

export default class Converter {
  constructor(command, param) {
    this.command = command
    this.param = param
  }

  async convert(stdin) {
    return new Promise((resolve, reject) => {
      const p = childProcess.spawn(this.command, this.param)
      let stdout = ''
      let stderr = ''
      p.stdout.setEncoding('utf-8')
      p.stderr.setEncoding('utf-8')

      p.on('exit', (code) => {
        if (code === 0) resolve(stdout)
        else reject(new Error(stderr))
      })

      p.on('error', (err) => {
        reject(new Error(err))
      })

      p.stdout.on('data', (data) => {
        stdout += data
      })

      p.stderr.on('data', (data) => {
        stderr += data
      })

      p.stdin.end(stdin)
    })
  }
}
