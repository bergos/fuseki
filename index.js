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

  var script = path.join(this.options.home, 'fuseki-server')

  this.process = spawn('bash', [script], {env: {FUSEKI_HOME: this.options.home}})

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

Server.prototype.createDataset = function (name, type) {
  return fetch(url.resolve(this.options.url, '$/datasets'), {
    method: 'post',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: urlencode({
      dbName: name,
      dbType: type
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
