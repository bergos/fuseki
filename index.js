var fetch = require('isomorphic-fetch')
var path = require('path')
var shelljs = require('shelljs')
var spawn = require('child_process').spawn
var url = require('url')
var urlencode = require('form-urlencoded')

function Server (options) {
  this.options = options || {}
  this.options.home = this.options.home || path.join(__dirname, 'fuseki')
  this.options.url = this.options.url || 'http://localhost:3030/'
}

Server.prototype.start = function () {
  var self = this
  var productionEnv = Object.create(process.env)

  var script = path.join(this.options.home, 'fuseki-server')

  productionEnv.FUSEKI_HOME = this.options.home
  this.process = spawn('bash', [script], productionEnv)

  if (this.options.pipeOutput) {
    this.process.stdout.pipe(process.stdout)
    this.process.stderr.pipe(process.stderr)
  }

  this.running = true

  this.process.on('close', function () {
    self.running = false
  })

  return Promise.resolve()
}

Server.prototype.stop = function () {
  this.process.kill()

  return Promise.resolve()
}

Server.prototype.alive = function () {
  return fetch(url.resolve(this.options.url, '$/ping')).then(function (res) {
    if (res.status !== 200) {
      return Promise.reject()
    }
  })
}

Server.prototype.wait = function (timeout) {
  var self = this

  timeout = timeout || 10000

  return new Promise(function (resolve, reject) {
    var next = function () {
      if (timeout <= 0) {
        return reject(new Error('timeout'))
      }

      self.alive().then(function () {
        resolve()
      }).catch(function () {
        setTimeout(function () {
          timeout -= 500

          next()
        }, 500)
      })
    }

    next()
  })
}

Server.prototype.datasets = function () {
  return fetch(url.resolve(this.options.url, '$/datasets')).then(function (res) {
    return res.json()
  }).then(function (json) {
    var datasets = {}

    json.datasets.forEach(function (dataset) {
      datasets[dataset['ds.name']] = dataset
    })

    return datasets
  })
}

Server.prototype.createDataset = function (name, type, filename, graph) {
  var self = this

  return this.datasets().then(function (datasets) {
    if (name in datasets) {
      return Promise.resolve()
    }

    return fetch(url.resolve(self.options.url, '$/datasets'), {
      method: 'post',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      body: urlencode({
        dbName: name,
        dbType: type
      })
    }).then(function () {
      if (!filename) {
        return Promise.resolve()
      }

      return self.uploadDataset(name, filename, graph)
    })
  })
}

Server.prototype.uploadDataset = function (name, filename, graph) {
  graph = graph || 'default'

  var script = path.join(this.options.home, 'bin/s-put')

  shelljs.exec(script + ' ' + url.resolve(this.options.url, name, 'data') + ' ' + graph + ' ' + filename)

  return Promise.resolve()
}

module.exports = Server
