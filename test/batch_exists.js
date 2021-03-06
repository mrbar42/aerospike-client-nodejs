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

var keygen = require('./generators/key')
var metagen = require('./generators/metadata')
var recgen = require('./generators/record')
var putgen = require('./generators/put')
var valgen = require('./generators/value')

var status = aerospike.status

describe('client.batchExists()', function () {
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

  it('should successfully find 10 records', function (done) {
    this.timeout(3000)
    // number of records
    var nrecords = 10

    // generators
    var kgen = keygen.string(options.namespace, options.set, {prefix: 'test/batch_exists/10/', random: false})
    var mgen = metagen.constant({ttl: 1000})
    var rgen = recgen.record({i: valgen.integer(), s: valgen.string(), b: valgen.bytes()})

    // writer using generators
    // callback provides an array of written keys
    putgen.put(client, nrecords, kgen, rgen, mgen, function (written) {
      var keys = Object.keys(written).map(function (key) {
        return written[key].key
      })

      var len = keys.length
      expect(len).to.equal(nrecords)

      client.batchExists(keys, function (err, results) {
        var result
        var j

        expect(err).to.be.ok()
        expect(err.code).to.equal(status.AEROSPIKE_OK)
        expect(results.length).to.equal(len)

        for (j = 0; j < results.length; j++) {
          result = results[j]
          expect(result.status).to.equal(status.AEROSPIKE_OK)
          if (j === nrecords - 1) {
            done()
          }
        }
      })
    })
  })

  it('should fail finding 10 records', function (done) {
    this.timeout(3000)
    // number of records
    var nrecords = 10

    // generators
    var kgen = keygen.string(options.namespace, options.set, {prefix: 'test/batch_exists/fail/', random: false})
    var keys = keygen.range(kgen, nrecords)

    client.batchExists(keys, function (err, results) {
      var result
      var j

      expect(err).to.be.ok()
      expect(err.code).to.equal(status.AEROSPIKE_OK)
      expect(results.length).to.equal(nrecords)

      for (j = 0; j < results.length; j++) {
        result = results[j]
        // This if-else check is introduced to handle test failures
        // in backward compatibility issues. Should be removed when an official release
        // of C client is done, with error code changes.
        if (result.status !== 602) {
          expect(result.status).to.equal(status.AEROSPIKE_ERR_RECORD_NOT_FOUND)
        } else {
          expect(result.status).to.equal(602)
        }
      }

      done()
    })
  })

  it('should successfully find 1000 records', function (done) {
    this.timeout(5000)
    // number of records
    var nrecords = 1000

    // generators
    var kgen = keygen.string(options.namespace, options.set, {prefix: 'test/batch_exists/1000/', random: false})
    var mgen = metagen.constant({ttl: 1000})
    var rgen = recgen.record({i: valgen.integer(), s: valgen.string(), b: valgen.bytes()})

    // writer using generators
    // callback provides an object of written records, where the
    // keys of the object are the record's keys.
    putgen.put(client, nrecords, kgen, rgen, mgen, function (written) {
      var keys = Object.keys(written).map(function (key) {
        return written[key].key
      })

      var len = keys.length
      expect(len).to.equal(nrecords)

      client.batchExists(keys, function (err, results) {
        var result
        var j

        expect(err).to.be.ok()
        expect(err.code).to.equal(status.AEROSPIKE_OK)
        expect(results.length).to.equal(len)

        for (j = 0; j < results.length; j++) {
          result = results[j]
          expect(result.status).to.equal(status.AEROSPIKE_OK)
        }

        done()
      })
    })
  })
})
