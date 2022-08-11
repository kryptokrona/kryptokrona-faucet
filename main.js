const express = require('express')();
const cors = require('cors')
const bodyParser = require('body-parser')
const rateLimit = require('express-rate-limit')
const {initWallet} = require("./wallet");

const PORT = 8083
const CORS_OPTIONS = {
    origin: '*',
    method: ['GET', 'POST']
}

const faucetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

//START WALLET
initWallet().then(r => console.log('Wallet started'))

express.use(bodyParser.json())

//Balance
const statusRoute = require('./routes/status')
express.use('/status', cors(CORS_OPTIONS), statusRoute)

//Faucet
express.use('/faucet', faucetLimiter)
const faucetRoute = require('./routes/faucet')
express.use('/faucet', cors(CORS_OPTIONS), faucetRoute)

express.listen(
    PORT,
    () => console.log(`It's live on http://localhost:${PORT} 🥳`)
)