'use strict';
let noble = require('noble');

class BulbCharacteristicClass {
    constructor(bulbAddress, uuid) {
        this.bulbAddress = bulbAddress;
        this.uuid = uuid;
        this.connected = false;
        let self = this;
        this.connect(function(result, nobleCharacteristic) {
            self.connectCallback(result, nobleCharacteristic);
        })
    }

    write(bytesBuffer) {
        if (this.connected) {
            this.nobleCharacteristic.write(bytesBuffer, true, function(error) {
                if (error) {
                    throw error;
                }
            });
        } else {
            console.log('Not Connected')
        }
    }

    /**
     * @private
     *
     * @param result
     * @param nobleCharacteristic
     */
    connectCallback(result, nobleCharacteristic) {
        if (!result) {
            throw 'Bulb not ready';
        }
        this.connected = true;
        this.nobleCharacteristic = nobleCharacteristic;
    }

    /**
     * @private
     */
    connect(callback) {
        let self = this;
        noble.on('stateChange', function(state) {
            if (state === 'poweredOn') {
                noble.startScanning()
            } else {
                callback(false);
                noble.stopScanning();
            }
        });
        noble.on('warning', function() {
            console.log(arguments);
        });
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

}

module.exports = {
    BulbCharacteristicClass: BulbCharacteristicClass
};
