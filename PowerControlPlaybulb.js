'use strict';

class PowerControlPlaybulbClass {
    constructor(playbulb) {
        this.playbulb = playbulb;
        this.brightness = undefined;
        this.whiteBrightness = undefined;
    }

    getWhitePowerOn(callback) {
        this.getWhiteBrightness(function (something, value) {
            callback(null, value > 0);
        });
    }

    setWhitePowerOn(value, callback) {
        if (value) {
            let self = this;
            this.getWhiteBrightness(function (something, value) {
                self.playbulb.setWhiteBrightness(value, callback);
            });
        } else {
            this.playbulb.setWhiteBrightness(0, callback);
        }
    }

    getPowerOn(callback) {
        this.getBrightness(function (something, value) {
            callback(null, value > 0);
        });
    }

    setPowerOn(value, callback) {
        if (value) {
            let self = this;
            this.getBrightness(function (something, value) {
                self.playbulb.setBrightness(value, callback);
            });
        } else {
            this.playbulb.setBrightness(0, callback);
        }
    }

    getWhiteBrightness(callback) {
        if (this.whiteBrightness !== undefined) {
            callback(null, this.whiteBrightness);
            return;
        }

        let self = this;

        this.playbulb.getWhiteBrightness(function (something, value) {
            self.whiteBrightness = value;
            callback(something, value);
        })
    }

    setWhiteBrightness(value, callback) {
        this.whiteBrightness = value;
        this.playbulb.setWhiteBrightness(this.whiteBrightness, callback);
    }

    getBrightness(callback) {
        if (this.brightness !== undefined) {
            callback(null, this.brightness);
            return;
        }

        let self = this;

        this.playbulb.getBrightness(function (something, value) {
            self.brightness = value;
            callback(something, value);
        })
    }

    setBrightness(value, callback) {
        this.brightness = value;
        this.playbulb.setBrightness(this.brightness, callback);
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
