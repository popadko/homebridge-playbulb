'use strict';
let noble = require('noble');

class BulbWithBrightnessClass {
    constructor(name, colorCharacteristic, brightnesChangeStrategy, log) {
        this.colorCharacteristic = colorCharacteristic;
        this.brightnesChangeStrategy = brightnesChangeStrategy;
        this.log = log;
        this.name = name;
        this.isPoweredOn = false;
        this.brightness = 100;
        this.log("Starting a playbulb device with name '" + this.name + "'...");
    }

    getPowerOn(callback) {
        this.log("Power state for the '%s' is %s", this.name, this.isPoweredOn);
        callback(null, this.isPoweredOn);
    }

    setPowerOn(isPoweredOn, callback) {
        let newValue = isPoweredOn ? 1 : 0;
        if (this.isPoweredOn === newValue) {
            callback(null);
            return;
        }
        this.isPoweredOn = newValue;
        let colorBytes = this.createTurnedOffPowerBuffer();
        if (isPoweredOn) {
            colorBytes = this.createBrightnessBuffer();
        }
        this.colorCharacteristic.write(colorBytes);
        callback(null);
    }

    getBrightness(callback) {
        callback(null, this.brightness);
    }

    setBrightness(value, callback) {
        let currentValue = this.getBrightnessValueInHexRange(this.brightness);
        this.brightness = value;
        let newValue = this.getBrightnessValueInHexRange(this.brightness);
        this.brightnesChangeStrategy.change(currentValue, newValue, this.colorCharacteristic);
        callback(null);
    }

    /**
     * @private
     * @returns {Buffer}
     */
    createTurnedOffPowerBuffer() {
        return new Buffer([0, 0, 0, 0]);
    }

    /**
     * @private
     * @returns {Buffer}
     */
    createBrightnessBuffer() {
        let brightnessValue = this.getBrightnessValueInHexRange(this.brightness);
        return new Buffer([brightnessValue, 0x0, 0x0, 0x0]);
    }

    /**
     * @private
     *
     * @param value
     * @returns {Number}
     */
    getBrightnessValueInHexRange(value) {
        return parseInt(this.bound01(value, 100, 255))
    }

    /**
     * @private
     * @returns {Buffer}
     */
    bound01(n, maxActual, maxExpected) {
        return (n * maxExpected) / maxActual;
    }
}

module.exports = {
    BulbWithBrightnessClass: BulbWithBrightnessClass
};
