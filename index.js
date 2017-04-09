'use strict';

let ExtendedBulbHombridgeServicesProviderClass = require('./ExtendedBulbHombridgeServicesProvider').ExtendedBulbHombridgeServicesProviderClass;

let Service;
let Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-playbulb", "PlayBulb", function (log, config) {
        return new ExtendedBulbHombridgeServicesProviderClass(Service, Characteristic, log, config);
    });
};
