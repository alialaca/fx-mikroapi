const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {pagination, dbConnectionChecker, timeout, errorHandler} = require('./middlewares')

const routes = require('./routes')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
    if(req.headers['authorization'] === `Bearer ${process.env.ACCESS_TOKEN}`){
        next()
    }else {
        res.status(401).json({
            status: false,
            message: "Erişim yetkiniz bulunmmaktadır."
        })
    }
})

app.use(timeout)
// app.use(dbConnectionChecker)
app.use(pagination.initPaginate)

app.use('/cari', routes.cariRoute);
app.use('/stok', routes.stokRoute);
app.use('/temsilci', routes.temsilciRoute)
app.use('/depo', routes.depoRoute)
app.use('/siparis', routes.siparisRoute)
app.use('/odeme-plan', routes.odemePlanRoute)
app.use('/satis', routes.satisRoute)
app.use('/aykur', routes.aykurRoute)
app.use('/maliyet', routes.maliyetRoute)
app.use('/kampanya', routes.kampanyaRoute)
app.use('/rapor', routes.raporRoute)

app.use('*', (req, res, next) => {
    res.status(404).json()
    // next()
})

app.use( errorHandler )

// app.use(Pagination.endPaginate)

module.exports = app;
