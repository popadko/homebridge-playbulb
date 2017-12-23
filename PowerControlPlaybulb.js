'use strict';

class PowerControlPlaybulbClass {
    constructor(playbulb) {
        this.playbulb = playbulb;
        this.brightness = undefined;
        this.on = undefined;
        this.whiteBrightness = undefined;
        this.whiteOn = undefined;
    }

    getWhitePowerOn(callback) {
        if (this.whiteOn === undefined) {
            let self = this;
            this.getWhiteBrightness(function(error, value) {
                if (value) {
                    self.whiteOn = value > 0;
                }
                callback(error, self.whiteOn);
            });
        } else {
            callback(null, this.whiteOn);
        }
    }

    setWhitePowerOn(value, callback) {
        if (value) {
            this.whiteOn = true;
            let self = this;
            this.getWhiteBrightness(function (error, value) {
                self.playbulb.setWhiteBrightness(value, callback);
            });
        } else {
            this.whiteOn = false;
            this.playbulb.setWhiteBrightness(0, callback);
        }
    }

    getWhiteBrightness(callback) {
        if (this.whiteBrightness !== undefined) {
            callback(null, this.whiteBrightness);
            return;
        }

        let self = this;

        this.playbulb.getWhiteBrightness(function(error, value) {
            self.whiteBrightness = value;
            callback(error, value);
        })
    }

    setWhiteBrightness(value, callback) {
        this.whiteBrightness = value;
        this.playbulb.setWhiteBrightness(this.whiteBrightness, callback);
    }

    getPowerOn(callback) {
        if (this.on === undefined) {
            let self = this;
            this.getBrightness(function(error, value) {
                if (value) {
                    self.on = value > 0;
                }
                callback(error, self.on);
            });
        } else {
            callback(null, this.on);
        }
    }

    setPowerOn(value, callback) {
        if (value) {
            this.on = true;
            let self = this;
            this.getBrightness(function (error, value) {
                self.playbulb.setBrightness(value, callback);
            });
        } else {
            this.on = false;
            this.playbulb.setBrightness(0, callback);
        }
    }

    getBrightness(callback) {
        if (this.brightness !== undefined) {
            callback(null, this.brightness);
            return;
        }

        let self = this;

        this.playbulb.getBrightness(function(error, value) {
            self.brightness = value;
            callback(error, value);
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
