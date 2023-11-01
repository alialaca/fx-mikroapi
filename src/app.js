const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const routes = require('./routes')
const Pagination = require('./middlewares/pagination')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(Pagination.initPaginate)

app.use('/cari', routes.cariRoute);
app.use('/stok', routes.stokRoute);
app.use('/temsilci', routes.temsilciRoute)
app.use('/depo', routes.depoRoute)
app.use('/siparis', routes.siparisRoute)
app.use('/odeme-plan', routes.odemePlanRoute)

// app.use(Pagination.endPaginate)

module.exports = app;
