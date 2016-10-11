/* global exec, mkdir, mv, test */

require('shelljs/global')

var path = require('path')

var fusekiTar = 'apache-jena-fuseki-2.4.0.tar.gz'
var fusekiDownload = path.join(__dirname, 'downloads', fusekiTar)
var fusekiUnzip = path.join(__dirname, fusekiTar.split('.').slice(0, -2).join('.'))
var fusekiApp = path.join(__dirname, 'fuseki')

if (!test('-f', fusekiDownload)) {
  mkdir('-p', 'downloads')
  exec('wget http://mirror.synyx.de/apache/jena/binaries/' + fusekiTar + ' -O "' + fusekiDownload + '"')
}

if (!test('-d', fusekiApp)) {
  exec('tar -xzf ' + fusekiDownload)
  mv(fusekiUnzip, fusekiApp)
}
