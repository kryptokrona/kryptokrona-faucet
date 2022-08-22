const {sendTransaction} = require("../wallet");
const {saveAddress, checkAddress} = require("../db");
const {validateAddress} = require("kryptokrona-wallet-backend-js");

const router = require('express').Router();

//TODO error handling
router.get('/', async (req, res) => {
    console.log('🚨 FAUCET REQUEST')

    const address = req.body.address
    const isValidAddress = await validateAddress(address, false)
    const alreadyClaimed = await checkAddress(address)

    if (isValidAddress && !alreadyClaimed) {
        const send = await sendTransaction(address)
        await saveAddress(address)

        res.status(200).send({
            sent: true,
            message: "Sent"
        })

        console.log('🚨 SENT XKR AND SAVED CLAIMER')

    } else if (!isValidAddress) {

        console.log('🚨 INVALID ADDRESS')
        res.status(200).send({
            sent: false,
            message: "invalid address"
        })

    } else if (alreadyClaimed) {

        console.log('🚨 ALREADY CLAIMED')
        res.status(200).send({
            sent: false,
            message: "already claimed"
        })

    }

})

module.exports = router