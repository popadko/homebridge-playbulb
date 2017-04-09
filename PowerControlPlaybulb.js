'use strict';

class PowerControlPlaybulbClass {
    constructor(playbulb) {
        this.playbulb = playbulb;
        this.brightness = 100;
        this.whiteBrightness = 100;
    }

    getWhitePowerOn(callback) {
        callback(null, this.whiteBrightness > 0);
    }

    setWhitePowerOn(value, callback) {
        if (value) {
            this.playbulb.setWhiteBrightness(this.whiteBrightness, callback);
        } else {
            this.playbulb.setWhiteBrightness(0, callback);
        }
    }

    getPowerOn(callback) {
        callback(null, this.brightness > 0);
    }

    setPowerOn(value, callback) {
        if (value) {
            this.playbulb.setBrightness(this.brightness, callback);
        } else {
            this.playbulb.setBrightness(0, callback);
        }
    }

    getWhiteBrightness(callback) {
        callback(null, this.whiteBrightness);
    }

    setWhiteBrightness(value, callback) {
        this.whiteBrightness = value;
        this.playbulb.setWhiteBrightness(this.whiteBrightness, callback);
    }

    getBrightness(callback) {
        callback(null, this.brightness);
    }

    setBrightness(value, callback) {
        this.brightness = value;
        this.playbulb.setBrightness(this.whiteBrightness, callback);
    }

    getHue(callback) {
        this.playbulb.getHue(callback);
    }

    setHue(value, callback) {
        this.playbulb.setHue(value, callback);
    }

    getSaturation(callback) {
        this.playbulb.getSaturation(callback);
    }

    setSaturation(value, callback) {
        this.playbulb.setSaturation(value, callback);
    }
}

module.exports = {
    PowerControlPlaybulbClass: PowerControlPlaybulbClass
};
