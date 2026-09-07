// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const cors = require('cors');
const path = require("path");

const app = express();


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
    req.on('aborted', () => {
        req.clientAborted = true;
    });
    next();
});



app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
    if (req.clientAborted || err.code === 'ECONNRESET' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
        return;
    }

    console.error(err);
    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ message: 'Request failed. Please try again.' });
});

const frontendPath = path.join(__dirname, "../../frontend/dist");

app.use(express.static(frontendPath));

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((err, req, res, next) => {
    if (req.clientAborted || err.code === 'ECONNRESET' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
        return;
    }

    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        message: 'Request failed. Please try again.'
    });
});


module.exports = app;