'use strict';

const i18n = require('i18n');
const path = require('path');
const util = require('util');
const http = require('http');

function AccessError(status, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AccessError);
    
    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Error';
}

util.inherits(AccessError, Error);

AccessError.prototype.name = 'AccessError';

module.exports = AccessError;