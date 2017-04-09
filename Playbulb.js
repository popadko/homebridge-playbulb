'use strict';

class PlaybulbClass {
    constructor(colorCharacteristic) {
        this.colorCharacteristic = colorCharacteristic;
        // this.whiteBrightness = this.colorCharacteristic.read();
        this.whiteBrightness = 100;
        this.hue = 0;
        this.saturation = 100;
        this.brightness = 100;
    }

    getWhiteBrightness(callback) {
        callback(null, this.whiteBrightness);
    }

    setWhiteBrightness(value, callback) {
        this.whiteBrightness = value;
        this.write();
        callback(null);
    }

    getBrightness(callback) {
        callback(null, this.brightness);
    }

    setBrightness(value, callback) {
        this.brightness = value;
        this.write();
        callback(null);
    }

    getHue(callback) {
        callback(null, this.hue);
    }

    setHue(value, callback) {
        this.hue = value;
        this.write();
        callback(null);
    }

    getSaturation(callback) {
        callback(null, this.saturation);
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
