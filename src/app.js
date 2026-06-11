const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(routes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the AngoSec API',
    });
});

app.use((req, res) => {
   status(404).json({
        success: false,
        message: 'Route not found',
    }); res.
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        error: err.message,
    });
    next();
});

module.exports = app;
