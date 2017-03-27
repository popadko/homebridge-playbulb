'use strict';

class ColorBulbHombridgeServicesProviderClass {

    constructor (colorBulb, homebridgeService, homebridgeCharacteristic) {
        this.colorBulb = colorBulb;
        this.homebridgeService = homebridgeService;
        this.homebridgeCharacteristic = homebridgeCharacteristic;
    }

    getServices() {
        let lightbulbService = new this.homebridgeService.Lightbulb(this.name);
        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.On)
            .on('get', this.colorBulb.getPowerOn.bind(this.colorBulb))
            .on('set', this.colorBulb.setPowerOn.bind(this.colorBulb));

        lightbulbService
            .getCharacteristic(this.homebridgeCharacteristic.Brightness)
            .on('get', this.colorBulb.getBrightness.bind(this.colorBulb))
            .on('set', this.colorBulb.setBrightness.bind(this.colorBulb));

        lightbulbService
            .addCharacteristic(Characteristic.Saturation)
            .on('get', this.colorBulb.getSaturation.bind(this.colorBulb))
            .on('set', this.colorBulb.setSaturation.bind(this.colorBulb));

        lightbulbService
            .addCharacteristic(Characteristic.Hue)
            .on('get', this.colorBulb.getHue.bind(this.colorBulb))
            .on('set', this.colorBulb.setHue.bind(this.colorBulb));

        return [lightbulbService];
    }
}

module.exports = {
    ColorBulbHombridgeServicesProviderClass: ColorBulbHombridgeServicesProviderClass
};
