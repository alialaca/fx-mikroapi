const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {pagination, dbConnectionChecker, timeout, errorHandler} = require('./middlewares')

const registerModuleRoutes = require('./loaders/routes.loader')

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

registerModuleRoutes(app)

app.use('*', (req, res) => {
    res.status(404).json()
})

app.use( errorHandler )

// app.use(Pagination.endPaginate)

module.exports = app;
