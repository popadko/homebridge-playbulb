'use strict';
let BulbClass = require('./bulb').BulbClass;
let Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-playbulb", "PlayBulb", function (log, config) {
        var bulb = new BulbClass(log, config, Service, Characteristic);
        return bulb;
    });
};

FakeBulbAccessory.prototype.isReady = function (callback) {
    if (callback) {
        if (this.connected) {
            setTimeout(callback, 0); // run async
        } else {
            this.waiting.push(callback);
        }
    } else if (this.colorChar !== null) {
        this.connected = true;
        var waiter;
        while (this.waiting.length > 0) {
            waiter = this.waiting.pop(0);
            setTimeout(waiter, 0); // run each waiter async
        }
    }
};

FakeBulbAccessory.prototype.connect = function (address) {
    var self = this;
    // connect to device and get characteristics, callback to ready listeners when done
    noble.on('stateChange', function(state) {
        if (state === 'poweredOn')
            noble.startScanning();
        else
            noble.stopScanning();
    });
    noble.on('warning', function() {
        console.log(arguments);
    });
    noble.on('discover', function(peripheral) {
        if (peripheral.address.toLowerCase() === address.toLowerCase()) {
            peripheral.connect(function(error) {
                if (error) {
                    throw error;
                }
                peripheral.discoverAllServicesAndCharacteristics(function(error, services) {
                    if (error) {
                        throw error;
                    }
                    services.forEach(function(service) {
                        service.discoverCharacteristics([], function(error, characteristics) {
                            if (error) {
                                throw error;
                            }
                            characteristics.forEach(function(characteristic) {
                                if (characteristic.uuid === self.colorUuid) {
                                    self.colorChar = characteristic;
                                    self.isReady();
                                }
                            });

                        });
                    });
                });
            });
        }
    });
};

function FakeBulbAccessory(log, config) {
    this.colorUuid = 'fffc';
    this.effectsUuid = 'fffb';
    this.connected = false;
    this.waiting = [];
    this.log = log;
    this.name = config["name"];
    this.bulbName = this.name; // fallback to "name" if you didn't specify an exact "bulb_name"
    this.binaryState = 0; // bulb state, default is OFF
    this.hue = 0;
    this.brightness = 100;
    this.saturation = 100;
    this.connect(config["address"]);
    this.log("Starting a playbulb device with name '" + this.bulbName + "'...");
}

FakeBulbAccessory.prototype.getPowerOn = function(callback) {
    console.log('getPowerOn');
    var powerOn = this.binaryState > 0;
    this.log("Power state for the '%s' is %s", this.bulbName, this.binaryState);
    callback(null, powerOn);
};

FakeBulbAccessory.prototype.setPowerOn = function(powerOn, callback) {
    this.log('setPowerOn');
    console.log('setPowerOn');
    var self = this;
    this.binaryState = powerOn ? 1 : 0;
    if (this.connected) {
        var colorBytes;
        if (powerOn) {
            var value = floatToHex(bound01(this.brightness, 100));
            colorBytes = new Buffer([value, value, value, value]);
        } else {
            colorBytes = new Buffer([0, 0, 0, 0]);
        }
        this.colorChar.write(colorBytes, true, function (error) {
            if (error) {
                throw error;
            } else {
                self.log("Set power state on the '%s' to %s", self.bulbName, self.binaryState);
            }
        });
    } else {
        this.log("Bulb \"%s\" is not ready", this.name);
    }
    callback(null);
};

FakeBulbAccessory.prototype.getHue = function(callback) {
    callback(null, this.hue);
};

FakeBulbAccessory.prototype.setHue = function(value, callback) {
    this.log('setHue');
    this.hue = value;
    this.write(hsvToRgb(this.hue, this.saturation, this.brightness));
    callback(null);
};

FakeBulbAccessory.prototype.getSaturation = function(callback) {
    callback(null, this.saturation);
};

FakeBulbAccessory.prototype.setSaturation = function(value, callback) {
    this.log('setSaturation');
    this.saturation = value;
    this.write(hsvToRgb(this.hue, this.saturation, this.brightness));
    callback(null);
};

FakeBulbAccessory.prototype.getBrightness = function(callback) {
    callback(null, this.brightness);
};

FakeBulbAccessory.prototype.setBrightness = function(value, callback) {
    this.log('setBrightness');
    this.brightness = value;
    var brightnessValue = floatToHex(bound01(this.brightness, 100));
    colorBytes = new Buffer([brightnessValue, brightnessValue, brightnessValue, brightnessValue]);
    callback(null);
};

FakeBulbAccessory.prototype.write = function (colorBytes) {
    if (this.connected) {
        this.colorChar.write(colorBytes, true, function (error) {
            if (error) {
                throw error;
            }
        });
    } else {
        this.log("Bulb \"%s\" is not ready", this.name);
    }
};

function hsvToRgb(h, s, v) {
    console.log(h, s, v);
    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);

    var i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    var values = [0x0, floatToHex(r), floatToHex(g), floatToHex(b)];
    console.log(values);
    var buffer = Buffer.from(values);
    console.log(buffer);
    return buffer;
}
