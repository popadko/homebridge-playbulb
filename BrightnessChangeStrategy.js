'use strict';

let sleep = require('sleep');

class BrightnessChangeStrategyClass {

    change(currentValue, newValue, bulbBrightnessCharacteristic) {
        let increase = currentValue < newValue;
        let i = currentValue;
        while (i != newValue) {
            if (increase) {
                i++;
            } else {
                i--;
            }
            bulbBrightnessCharacteristic.write(new Buffer([i, 0x0, 0x0, 0x0]));
            sleep.msleep(3);
        }
    }
}


module.exports = {
    BrightnessChangeStrategyClass: BrightnessChangeStrategyClass
};
