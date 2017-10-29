'use strict';

class PlaybulbClass {
    constructor(colorCharacteristic) {
        this.colorCharacteristic = colorCharacteristic;
        this.whiteBrightness = undefined;
        this.hue = undefined;
        this.saturation = undefined;
        this.brightness = undefined;
    }

    read(callback) {
        let self = this;

        this.colorCharacteristic.read(function (error, buffer) {
            self.whiteBrightness = self.bound01(buffer[0], 255) * 100;
            let hsv = self.rgbToHsv(buffer[1], buffer[2], buffer[3]);
            self.hue = hsv.h;
            self.saturation = hsv.s;
            self.brightness = hsv.v;
            callback();
        });
    }

    getWhiteBrightness(callback) {
        let self = this;

        if (this.whiteBrightness !== undefined) {
            callback(null, self.whiteBrightness);
            return;
        }

        this.read(function () {
            callback(null, self.whiteBrightness);
        });
    }

    setWhiteBrightness(value, callback) {
        this.whiteBrightness = value;
        this.write();
        callback(null);
    }

    getBrightness(callback) {
        let self = this;

        if (this.brightness !== undefined) {
            callback(null, self.brightness);
            return;
        }

        this.read(function () {
            callback(null, self.brightness);
        });
    }

    setBrightness(value, callback) {
        this.brightness = value;
        this.write();
        callback(null);
    }

    getHue(callback) {
        let self = this;

        if (this.hue !== undefined) {
            callback(null, self.hue);
            return;
        }

        this.read(function () {
            callback(null, self.hue);
        });
    }

    setHue(value, callback) {
        this.hue = value;
        this.write();
        callback(null);
    }

    getSaturation(callback) {
        let self = this;

        if (this.saturation !== undefined) {
            callback(null, self.saturation);
            return;
        }

        this.read(function () {
            callback(null, self.saturation);
        });
    }

    setSaturation(value, callback) {
        this.saturation = value;
        this.write();
        callback(null);
    }

    /**
     * @private
     *
     * @param value
     * @returns {Number}
     */
    getBrightnessValueInHexRange(value) {
        return parseInt(this.convertWithNewMaxValue(value, 100, 255))
    }

    /**
     * @private
     * @returns {Buffer}
     */
    convertWithNewMaxValue(n, maxActual, maxExpected) {
        return (n * maxExpected) / maxActual;
    }

    /**
     * @private
     *
     * @param buffer
     */
    write() {
        let rgb = this.hsvToRgb(this.hue, this.saturation, this.brightness);
        let brightness = this.getBrightnessValueInHexRange(this.whiteBrightness);
        let buffer = new Buffer([brightness, rgb.r, rgb.g, rgb.b]);
        this.colorCharacteristic.write(buffer);
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    /**
     * @private
     *
     * @param r
     * @param g
     * @param b
     * @returns {{h: *, s: (number|*), v: *}}
     */
    rgbToHsv(r, g, b) {
        r = this.bound01(r, 255);
        g = this.bound01(g, 255);
        b = this.bound01(b, 255);

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, v: v * 100 };
    }

    /**
     * @private
     *
     * @param h
     * @param s
     * @param v
     * @returns {Array}
     */
    hsvToRgb(h, s, v) {
        h = this.bound01(h, 360) * 6;
        s = this.bound01(s, 100);
        v = this.bound01(v, 100);

        var i = Math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }


    // Take input from [0, n] and return it as [0, 1]
    bound01(n, max) {
        if (this.isOnePointZero(n)) {
            n = "100%";
        }

        var processPercent = this.isPercentage(n);
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

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }
}

module.exports = {
    PlaybulbClass: PlaybulbClass
};
