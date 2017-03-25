'use strict';
let noble = require('noble');

class BulbClass {
    constructor(log, config, homebridgeService, homebridgeCharacteristic) {
        this.homebridgeService = homebridgeService;
        this.homebridgeCharacteristic = homebridgeCharacteristic;
        this.connected = false;
        this.log = log;
        this.name = config["name"];
        this.binaryState = 0; // bulb state, default is OFF
        this.brightness = 100;
        let self = this;
        let colorUuid = 'fffc';
        BulbClass.connect(config["address"], colorUuid, function (connected, nobleCharacteristic) {
            self.nobleCharacteristic = nobleCharacteristic;
            self.connected = connected;
        });
        this.log("Starting a playbulb device with name '" + this.name + "'...");
    }

    getServices() {
        let lightbulbService = new this.homebridgeService.Lightbulb(this.name);
        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.On)
            .on('get', this.getPowerOn.bind(this))
            .on('set', this.setPowerOn.bind(this));

        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.Brightness)
            .on('get', this.getBrightness.bind(this))
            .on('set', this.setBrightness.bind(this));

        // lightbulbService
        //     .addCharacteristic(Characteristic.Saturation)
        //     .on('get', this.getSaturation.bind(this))
        //     .on('set', this.setSaturation.bind(this));
        //
        // lightbulbService
        //     .addCharacteristic(Characteristic.Hue)
        //     .on('get', this.getHue.bind(this))
        //     .on('set', this.setHue.bind(this));

        return [lightbulbService];
    }

    getPowerOn(callback) {
        let powerOn = this.binaryState > 0;
        this.log("Power state for the '%s' is %s", this.name, this.binaryState);
        callback(null, powerOn);
    }

    setPowerOn(powerOn, callback) {
        this.binaryState = powerOn ? 1 : 0;
        let colorBytes = new Buffer([0, 0, 0, 0]);
        if (powerOn) {
            colorBytes = this.createBrightnessBuffer();
        }
        this.write(colorBytes);
        callback(null);
    }

    getBrightness(callback) {
        callback(null, this.brightness);
    }

    setBrightness(value, callback) {
        this.brightness = value;
        this.write(this.createBrightnessBuffer());
        callback(null);
    }

    write(colorBytes) {
        if (!this.connected) {
            this.log("Bulb \"%s\" is not ready", this.name);
            return;
        }

        this.nobleCharacteristic.write(colorBytes, true, function(error) {
            if (error) {
                throw error;
            }
        });
    }

    static connect(address, colorUuid, callback) {
        noble.on('stateChange', function(state) {
            if (state === 'poweredOn') {
                noble.startScanning();
            } else {
                callback(false, colorUuid);
                noble.stopScanning();
            }
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
                                    if (characteristic.uuid === colorUuid) {
                                        callback(true, characteristic);
                                    }
                                });

                            });
                        });
                    });
                });
            }
        });
    }

    createBrightnessBuffer() {
        let brightnessValue = parseInt(BulbClass.bound01(this.brightness, 100, 255));
        return new Buffer([brightnessValue, 0x0, 0x0, 0x0]);
    }

    static bound01(n, maxActual, maxExpected) {
        return (n * maxExpected) / maxActual;
    }
}

module.exports = {
    BulbClass: BulbClass
};
