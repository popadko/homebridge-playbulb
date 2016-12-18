var noble = require('noble');
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-playbulb", "PlayBulb", FakeBulbAccessory);
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

FakeBulbAccessory.prototype.getServices = function() {
    var lightbulbService = new Service.Lightbulb(this.name);

    lightbulbService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPowerOn.bind(this))
        .on('set', this.setPowerOn.bind(this));

    lightbulbService
        .getCharacteristic(Characteristic.Brightness)
        .on('get', this.getBrightness.bind(this))
        .on('set', this.setBrightness.bind(this));

    lightbulbService
        .addCharacteristic(Characteristic.Saturation)
        .on('get', this.getSaturation.bind(this))
        .on('set', this.setSaturation.bind(this));

    lightbulbService
        .addCharacteristic(Characteristic.Hue)
        .on('get', this.getHue.bind(this))
        .on('set', this.setHue.bind(this));

    return [lightbulbService];
};

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}

// Check to see if string passed in is a percentage
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}

function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = Math.min(max, Math.max(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((Math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}

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


function floatToHex(float) {
    return (float * 255) & 0xff;
}
