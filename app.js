import "core-js/stable";
import "regenerator-runtime/runtime";

require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(indexRouter);

module.exports = app;
