const {sendTransaction} = require("../wallet");
const {saveAddress, checkAddress} = require("../db");
const {validateAddress} = require("kryptokrona-wallet-backend-js");

const router = require('express').Router();

router.get('/', async (req, res) => {
    console.log('🚨 FAUCET REQUEST')

    const address = req.body.address
    const isValidAddress = await validateAddress(address, false)

    const claimed = await checkAddress(address)

    if (isValidAddress && !claimed) {

        const send = await sendTransaction(address)
        await saveAddress(address)
        res.status(200).send({"message": "sent"})
        console.log('🚨 SENT XKR AND SAVED CLAIMER')

    } else if (!isValidAddress) {

        console.log('🚨 INVALID ADDRESS')
        res.status(200).send({"message": "invalid address"})

    } else if (claimed) {

        console.log('🚨 ALREADY CLAIMED')
        res.status(200).send({"message": "already claimed"})

    }

})

module.exports = router