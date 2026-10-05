const { getWalletInfo, getNodeInfo } = require("../wallet");
const { getHowManyClaimers } = require("../db");
const router = require('express').Router();

router.get('/', async (req, res) => {
    console.log('🚨 STATUS REQUEST')

    try {
        const [wallet, node, claimers] = await Promise.all([
            getWalletInfo(),
            getNodeInfo(),
            getHowManyClaimers(),
        ])

        const walletInfo = {
            unlocked: wallet.balance[0],
            locked: wallet.balance[1],
            total: (wallet.balance[0] + wallet.balance[1]),
            address: wallet.address,
            claimers,
            node,
        }

        res.status(200).send(walletInfo)
    } catch (err) {
        console.error('Status request failed:', err)

        res.status(503).send({
            error: 'Unable to load faucet status',
            message: err.toString(),
        })
    }
})

module.exports = router
