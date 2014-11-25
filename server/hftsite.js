/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

var config  = require('../lib/config');
var debug   = require('debug')('hftsite');
var io      = require('../lib/io');
var restUrl = require('rest-url');

var g = {
  throttleTime: 1000
};

var getTime = function() {
  return Date.now();
};

// Sends the local ip address and port
var inform = (function() {
  var lastAddress;
  var lastPort;
  var lastTime = 0;

  return function() {
    if (!g.privateServer && g.port && g.address) {
      var now = getTime();
      var elapsedTime = now - lastTime;
      if (lastAddress != g.address ||
          lastPort != g.port ||
          elapsedTime > g.throttleTime) {
        lastTime = now;
        lastAddress = g.address;
        lastPort = g.port;
        var url = restUrl.make(process.env.HFT_RENDEZVOUS_URL || config.getSettings().settings.rendezvousUrl, {
          hftip: g.address,
          hftport: g.port,
        })
        debug("ping: " + url);
        io.sendJSON(url, {}, {}, function(err, result) {
          // do I care?
          if (err) {
            console.error(err);
          }
        });
      }
    }
  };
}());

/**
 * @typedef {Object} HFTSite~Options
 * @property {string?} address ip address eg. "1.2.3.4"
 * @property {string?} port port eg "18679"
 * @property {boolean?} privateServer true = don't send info to hftsite
 */

/**
 * Set options for hftSize
 *
 * @param {HFTSite~Options} options
 */
var setup = function(options) {
  ["address", "port", "privateServer"].forEach(function(key) {
    var value = options[key];
    if (value !== undefined) {
      g[key] = value;
    }
  });
};

exports.inform = inform;
exports.setup = setup;

