const { getWalletInfo } = require("../wallet");
const {getClaimers} = require("../db");
const router = require('express').Router();

//Gets info about wallet and responds
//TODO error handling
router.get('/', async (req, res) => {
    console.log('🚨 STATUS REQUEST')
    let wallet = await getWalletInfo()

    let claimers = await getClaimers()
    const walletInfo = {
        unlocked: wallet.balance[0],
        locked: wallet.balance[1],
        total: (wallet.balance[0] + wallet.balance[1]),
        refillAddress: wallet.address,
        claimers,
    }

    res.status(200).send(walletInfo)
})



module.exports = router