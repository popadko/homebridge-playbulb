'use strict';
let noble = require('noble');

class BulbCharacteristicClass {
    constructor(bulbAddress, uuid) {
        this.bulbAddress = bulbAddress;
        this.uuid = uuid;
        this.connected = false;
        this.poweredOn = false;
        this.connecting = false;
        this.connectionTimeout = undefined;
        this.connectionTimeoutDelay = 20000;
        this.noblePeripheral = undefined;
        this.nobleCharacteristic = undefined;
        let self = this;
        noble.on('stateChange', function(state) {
            self.poweredOn = true;
            if (state !== 'poweredOn') {
                self.poweredOn = false;
                self.connectCallback(false);
                noble.stopScanning();
            }
        });
        noble.on('warning', function() {
            console.log(arguments);
        });
    }

    write(bytesBuffer) {
        let self = this;
        this.setConnectionTimeout();
        this.connect(function() {
            if (self.nobleCharacteristic) {
                self.nobleCharacteristic.write(bytesBuffer, true, function(error) {
                    if (error) {
                        throw error;
                    }
                });
            }
        });
    }

    read(callback) {
        let self = this;
        this.setConnectionTimeout();
        this.connect(function() {
            if (self.nobleCharacteristic) {
                self.nobleCharacteristic.read(callback);
            } else {
                callback(true);
            }
        });
    }

    /**
     * @private
     *
     * @param result
     * @param noblePeripheral
     * @param nobleCharacteristic
     */
    connectCallback(result, noblePeripheral, nobleCharacteristic) {
        this.connected = result;
        if (result) {
            this.noblePeripheral = noblePeripheral;
            this.nobleCharacteristic = nobleCharacteristic;
            let self = this;
            this.noblePeripheral.once('disconnect', function () {
                self.connectCallback(false);
            });
        }
        this.connecting = false;
    }

    /**
     * @private
     */
    setConnectionTimeout() {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = setTimeout(this.connectionTimeoutCallback.bind(this), this.connectionTimeoutDelay);
    }

    /**
     * @private
     */
    connectionTimeoutCallback() {
        if (this.noblePeripheral) {
            this.noblePeripheral.disconnect();
        }
    }

    /**
     * @private
     */
    connect(callback) {
        if (this.poweredOn === false || this.connected === true) {
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

        if (this.noblePeripheral) {
            this.discoverCharacteristics(callback);
            return;
        }

        let connectionTimeout = setTimeout(function () {
            noble.stopScanning();
            self.connectCallback(false);
            callback();
        }, 20000);

        noble.startScanning();
        noble.on('discover', function(peripheral) {
            if (peripheral.address.toLowerCase() === self.bulbAddress.toLowerCase()) {
                clearTimeout(connectionTimeout);
                noble.stopScanning();
                self.noblePeripheral = peripheral;
                self.discoverCharacteristics(callback)
            }
        });
    }

    discoverCharacteristics(callback) {
        let self = this;
        this.noblePeripheral.connect(function(error) {
            if (error) {
                throw error;
            }
            self.noblePeripheral.discoverAllServicesAndCharacteristics(function(error, services) {
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
                                self.connectCallback(true, self.noblePeripheral, characteristic);
                                callback();
                            }
                        });
                    });
                });
            });
        });
    }
}

module.exports = {
    BulbCharacteristicClass: BulbCharacteristicClass
};
