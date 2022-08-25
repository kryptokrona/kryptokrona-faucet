const { getWalletInfo } = require("../wallet");
const { getHowManyClaimers } = require("../db");
const router = require('express').Router();

//TODO error handling
router.get('/', async (_req, res) => {
    console.log('🚨 STATUS REQUEST')

    let wallet = await getWalletInfo()
    let claimers = await getHowManyClaimers()

    const walletInfo = {
        unlocked: wallet.balance[0],
        locked: wallet.balance[1],
        total: (wallet.balance[0] + wallet.balance[1]),
        address: wallet.address,
        claimers,
    }

    res.status(200).send(walletInfo)
})

module.exports = router