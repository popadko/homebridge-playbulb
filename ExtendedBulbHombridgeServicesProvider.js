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
        let powerdControlPlaybulb = new PowerControlPlaybulbClass(playbulb);

        let simpleLightbulbService = new this.homebridgeService.Lightbulb(this.config['name'], 'simple');
        simpleLightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.On)
            .on('get', powerdControlPlaybulb.getWhitePowerOn.bind(powerdControlPlaybulb))
            .on('set', powerdControlPlaybulb.setWhitePowerOn.bind(powerdControlPlaybulb));

        simpleLightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.Brightness)
            .on('get', powerdControlPlaybulb.getWhiteBrightness.bind(powerdControlPlaybulb))
            .on('set', powerdControlPlaybulb.setWhiteBrightness.bind(powerdControlPlaybulb));

        let lightbulbService = new this.homebridgeService.Lightbulb(this.config['name'], 'color');
        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.On)
            .on('get', powerdControlPlaybulb.getPowerOn.bind(powerdControlPlaybulb))
            .on('set', powerdControlPlaybulb.setPowerOn.bind(powerdControlPlaybulb));

        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.Brightness)
            .on('get', powerdControlPlaybulb.getBrightness.bind(powerdControlPlaybulb))
            .on('set', powerdControlPlaybulb.setBrightness.bind(powerdControlPlaybulb));

        lightbulbService
            .addCharacteristic(this.homebridgeCharacteristic.Saturation)
            .on('get', powerdControlPlaybulb.getSaturation.bind(powerdControlPlaybulb))
            .on('set', powerdControlPlaybulb.setSaturation.bind(powerdControlPlaybulb));

        lightbulbService
            .addCharacteristic(this.homebridgeCharacteristic.Hue)
            .on('get', powerdControlPlaybulb.getHue.bind(powerdControlPlaybulb))
            .on('set', powerdControlPlaybulb.setHue.bind(powerdControlPlaybulb));

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
