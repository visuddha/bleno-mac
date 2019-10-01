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

EchoCharacteristic.prototype.start = function () {
  console.log("Starting counter");
  // this.handle = setInterval(() => {
  //   console.log("Interval !!!")
  //     // this.counter = (this.counter + 1) % 0xFFFF;
  //     this._value = "Helo World!";
  //     this.sendNotification(this._value % 0xFFFF);
  // }, 100);
  var fs = require('fs');
  var arr = fs.readFileSync('/Users/visuddha/Desktop/ble/bleno-mac/examples/echo/test-data-glove.txt').toString().split("\n");
  for (let index = 0; index < arr.length; index++) {
    sleep(100);
    var str = arr[index] + "/0";
    console.log(index + 1 + " => Sending: " + str);
    this.sendNotification(arr[index] + "/0")
  }  
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