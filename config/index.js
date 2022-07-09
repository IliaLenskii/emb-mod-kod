
const site = require('./site');
const license = require('./lic');
const kodProd = require('./kodeks-product');
const userEvents = require('./user-events');

/*
 *  Возможно, для разных сборок (development | production)
 *  нужно использовать разные конфиги выше
 *  global.KServerApi.pluginProduction 
 *  
 */

module.exports.license = license;
module.exports.site = site;
module.exports.kodProd = kodProd;
module.exports.userEvents = userEvents;
