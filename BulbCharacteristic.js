'use strict';
let noble = require('noble');

class BulbCharacteristicClass {
    constructor(bulbAddress, uuid) {
        this.bulbAddress = bulbAddress;
        this.uuid = uuid;
        this.connected = false;
        this.poweredOn = false;
        this.connecting = false;
        let self = this;
        noble.on('stateChange', function(state) {
            self.poweredOn = true;
            if (state !== 'poweredOn') {
                self.connectCallback(false);
                self.poweredOn = false;
                noble.stopScanning();
            }
        });
        noble.on('warning', function() {
            console.log(arguments);
        });
    }

    write(bytesBuffer) {
        let self = this;
        if (this.connected) {
            this.nobleCharacteristic.write(bytesBuffer, true, function(error) {
                if (error) {
                    throw error;
                }
            });
        } else {
            this.connect(function() {
                self.nobleCharacteristic.write(bytesBuffer, true, function(error) {
                    if (error) {
                        throw error;
                    }
                })
            })
        }
    }

    read(callback) {
        let self = this;
        if (this.connected) {
            this.nobleCharacteristic.read(callback);
        } else {
            this.connect(function() {
                self.nobleCharacteristic.read(callback)
            });
        }
    }

    /**
     * @private
     *
     * @param result
     * @param nobleCharacteristic
     */
    connectCallback(result, nobleCharacteristic) {
        this.connected = false;
        if (result) {
            this.nobleCharacteristic = nobleCharacteristic;
            this.connected = true;
        }
        this.connecting = false;
    }

    /**
     * @private
     */
    connect(callback) {
        if (this.connected === true) {
            callback();
            return;
        }

        let self = this;

        if (this.connecting === true) {
            setTimeout(function() {
                if (self.connected === true) {
                    callback();
                } else {
                    self.connect(callback);
                }
            }, 1000);
            return;
        }
        this.connecting = true;
        this.scanningTimeout(callback);
    }

    scanningTimeout(callback) {
        let self = this;
        setTimeout(function() {
            if (self.poweredOn) {
                self.scanning(callback);
            } else {
                self.scanningTimeout(callback);
            }
        }, 1000);
    }

    scanning(callback) {
        let self = this;
        noble.startScanning();
        noble.on('discover', function(peripheral) {
            if (peripheral.address.toLowerCase() === self.bulbAddress.toLowerCase()) {
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
                                    if (characteristic.uuid === self.uuid) {
                                        noble.stopScanning();
                                        self.connectCallback(true, characteristic);
                                        callback();
                                    }
                                });

                            });
                        });
                    });
                });
            }
        });
    }
}

module.exports = {
    BulbCharacteristicClass: BulbCharacteristicClass
};
