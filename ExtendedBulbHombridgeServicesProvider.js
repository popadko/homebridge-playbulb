'use strict';

let BulbCharacteristicClass = require('./BulbCharacteristic').BulbCharacteristicClass;

let PlaybulbClass = require('./Playbulb').PlaybulbClass;
let PowerControlPlaybulbClass = require('./PowerControlPlaybulb').PowerControlPlaybulbClass;

/**
 * @private
 */
const colorUUID = 'fffc';

class ExtendedBulbHombridgeServicesProviderClass {

    constructor (homebridgeService, homebridgeCharacteristic, log, config) {
        this.homebridgeService = homebridgeService;
        this.homebridgeCharacteristic = homebridgeCharacteristic;
        this.log = log;
        this.config = config;
    }

    getServices() {
        let playbulb = new PlaybulbClass(this.createColorCharacteristic(this.config['address']));
        let powerControlPlaybulb = new PowerControlPlaybulbClass(playbulb);

        let simpleLightbulbService = new this.homebridgeService.Lightbulb(this.config['name'], 'simple');
        simpleLightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.On)
            .on('get', powerControlPlaybulb.getWhitePowerOn.bind(powerControlPlaybulb))
            .on('set', powerControlPlaybulb.setWhitePowerOn.bind(powerControlPlaybulb));

        simpleLightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.Brightness)
            .on('get', powerControlPlaybulb.getWhiteBrightness.bind(powerControlPlaybulb))
            .on('set', powerControlPlaybulb.setWhiteBrightness.bind(powerControlPlaybulb));

        let lightbulbService = new this.homebridgeService.Lightbulb(this.config['name'], 'color');
        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.On)
            .on('get', powerControlPlaybulb.getPowerOn.bind(powerControlPlaybulb))
            .on('set', powerControlPlaybulb.setPowerOn.bind(powerControlPlaybulb));

        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.Brightness)
            .on('get', powerControlPlaybulb.getBrightness.bind(powerControlPlaybulb))
            .on('set', powerControlPlaybulb.setBrightness.bind(powerControlPlaybulb));

        lightbulbService
            .addCharacteristic(this.homebridgeCharacteristic.Saturation)
            .on('get', powerControlPlaybulb.getSaturation.bind(powerControlPlaybulb))
            .on('set', powerControlPlaybulb.setSaturation.bind(powerControlPlaybulb));

        lightbulbService
            .addCharacteristic(this.homebridgeCharacteristic.Hue)
            .on('get', powerControlPlaybulb.getHue.bind(powerControlPlaybulb))
            .on('set', powerControlPlaybulb.setHue.bind(powerControlPlaybulb));

        return [simpleLightbulbService, lightbulbService];
    }

    /**
     * @private
     */
    createColorCharacteristic(bulbAddress) {
        return new BulbCharacteristicClass(bulbAddress, colorUUID);
    }
}

module.exports = {
    ExtendedBulbHombridgeServicesProviderClass: ExtendedBulbHombridgeServicesProviderClass
};
