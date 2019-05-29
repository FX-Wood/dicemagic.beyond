// conveniently put expect and sinon in global scope
global.expect = require('chai').expect
global.sinon = require('sinon')

// import content script before constructing DOM
global.content = require('../js/content')

// read html file and instantiate DOM
const fs = require('fs')
const tamanHTML = fs.readFileSync('test/taman2.html')
require('jsdom-global')(tamanHTML)