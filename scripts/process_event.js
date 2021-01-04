import "core-js/stable";
import "regenerator-runtime/runtime";

require('dotenv').config();

const eventSdk = require('../services/events').default;

eventSdk.jobs.updateListings({});