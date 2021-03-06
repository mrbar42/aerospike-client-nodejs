// *****************************************************************************
// Copyright 2013-2016 Aerospike, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// *****************************************************************************

/* global describe, it, before, after */

// we want to test the built aerospike module
var aerospike = require('../build/Release/aerospike')
var options = require('./util/options')
var expect = require('expect.js')

var status = aerospike.status

describe('client.info()', function () {
  var config = options.getConfig()
  var client = aerospike.client(config)

  before(function (done) {
    client.connect(function (err) {
      if (err && err.code !== status.AEROSPIKE_OK) { throw new Error(err.message) }
      done()
    })
  })

  after(function (done) {
    client.close()
    client = null
    done()
  })

  it('should get "objects" from entire cluster', function (done) {
    var host = {addr: options.host, port: options.port}
    client.info('objects', host, function (err, response, host) {
      expect(err).to.be.ok()
      expect(err.code).to.equal(status.AEROSPIKE_OK)
      done()
    })
  })
})
