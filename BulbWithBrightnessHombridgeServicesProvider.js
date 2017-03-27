'use strict';

class BulbWithBrightnessHombridgeServicesProviderClass {

    constructor (bulbWithBrightness, homebridgeService, homebridgeCharacteristic) {
        this.bulbWithBrightness = bulbWithBrightness;
        this.homebridgeService = homebridgeService;
        this.homebridgeCharacteristic = homebridgeCharacteristic;
    }

    getServices() {
        let lightbulbService = new this.homebridgeService.Lightbulb(this.name);
        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.On)
            .on('get', this.bulbWithBrightness.getPowerOn.bind(this.bulbWithBrightness))
            .on('set', this.bulbWithBrightness.setPowerOn.bind(this.bulbWithBrightness));

        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.Brightness)
            .on('get', this.bulbWithBrightness.getBrightness.bind(this.bulbWithBrightness))
            .on('set', this.bulbWithBrightness.setBrightness.bind(this.bulbWithBrightness));

        return [lightbulbService];
    }
}

module.exports = {
    BulbWithBrightnessHombridgeServicesProviderClass: BulbWithBrightnessHombridgeServicesProviderClass
};
