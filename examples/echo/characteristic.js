var util = require('util');

var bleno = require('../..');
var fs = require("fs");
var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristic = function () {
  EchoCharacteristic.super_.call(this, {
    uuid: 'ec0e',
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
  this.interval = 0;
};

util.inherits(EchoCharacteristic, BlenoCharacteristic);

EchoCharacteristic.prototype.onReadRequest = function (offset, callback) {
  console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

EchoCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));

  if (this._updateValueCallback) {
    console.log('EchoCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
  this.start();
};

EchoCharacteristic.prototype.onUnsubscribe = function () {
  console.log('EchoCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};


EchoCharacteristic.prototype.sendNotification = function (value) {
  if (this._updateValueCallback) {
    var enc = new util.TextEncoder();
    this._updateValueCallback(enc.encode(value));
  }
}

EchoCharacteristic.prototype.start = async function () {
  console.log("Starting counter");
  await sleep(11000)
  var counter = 0;
  var payloads = 20;
  this.handle = setInterval(() => {
    var str = "v2|1|AWSPERF00001|0|"+new Date().toISOString()+"|98935|4.62|8.52|-3.89|-87.00|61.00|171.00" 
    if (counter % payloads == 0) {
      str = "[" + str + ","
    } else if (counter % payloads == payloads-1) {
      str = str + "]/0"
    } else {
      str = str + ","
    }
    this.sendNotification(str)
    console.log(str)
    counter++;
  }, 50);
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

EchoCharacteristic.prototype.stop = function () {
  console.log("Stopping counter");
  clearInterval(this.handle);
  this.handle = null;
}

module.exports = EchoCharacteristic;