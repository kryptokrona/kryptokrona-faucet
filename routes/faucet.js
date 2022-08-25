const {sendTransaction} = require("../wallet");
const {saveAddress, checkAddress} = require("../db");
const {validateAddress} = require("kryptokrona-wallet-backend-js");
const WB = require("kryptokrona-wallet-backend-js");

const router = require('express').Router();

router.post('/', async (req, res) => {
    console.log('🚨 FAUCET REQUEST')

    //Check if address is valid
    const address = req.body.address
    const isValidAddress = await validateAddress(address, false)

    //If valid address check if already claimed
    let alreadyClaimed
    if (isValidAddress) {
        alreadyClaimed = await checkAddress(address)
    }

    if (isValidAddress && !alreadyClaimed) {
        const send = await sendTransaction(address)

        if (send.success) {
            res.status(200).send({
                sent: true,
                message: "Sent"
            })
            console.log(`Sent transaction, hash ${send.transactionHash}, fee ${WB.prettyPrintAmount(send.fee)}`);
            await saveAddress(address)
            console.log('🚨 SENT XKR AND SAVED CLAIMER')
        } else {
            res.status(500).send({
                sent: false,
                message: send.error.toString()
            })
            console.log(`Failed to send transaction: ${send.error.toString()}`);
        }

    } else if (!isValidAddress) {

        console.log('🚨 INVALID ADDRESS')
        res.status(200).send({
            sent: false,
            message: "Invalid address"
        })

    } else if (alreadyClaimed) {

        console.log('🚨 ALREADY CLAIMED')
        res.status(200).send({
            sent: false,
            message: "Already claimed"
        })

    } else res.status(500).send({
        sent: false,
        message: "Unknown error"
    })

})

module.exports = router