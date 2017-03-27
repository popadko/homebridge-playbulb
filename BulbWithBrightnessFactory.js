'use strict';
let BulbWithBrightnessClass = require('./BulbWithBrightness').BulbWithBrightnessClass;
let BulbCharacteristicClass = require('./BulbCharacteristic').BulbCharacteristicClass;
let BrightnessChangeStrategyClass = require('./BrightnessChangeStrategy').BrightnessChangeStrategyClass;

/**
 * @private
 */
const colorUUID = 'fffc';

class BulbWithBrightnessFactoryClass {

    create(bulbAddress, name, log) {
        return new BulbWithBrightnessClass(
            name,
            this.createColorCharacteristic(bulbAddress),
            this.createBrightnessChangeStrategy(),
            log
        );
    }

    /**
     * @private
     */
    createColorCharacteristic(bulbAddress) {
        return new BulbCharacteristicClass(bulbAddress, colorUUID);
    }

    /**
     * @private
     */
    createBrightnessChangeStrategy() {
        return new BrightnessChangeStrategyClass();
    }
}

module.exports = {
    BulbWithBrightnessFactoryClass: BulbWithBrightnessFactoryClass
};
