const {sendTransaction} = require("../wallet");
const {saveAddress, checkAddress} = require("../db");

const router = require('express').Router();

//TODO error handling and reCaptcha
router.get('/', async (req, res) => {
    console.log('🚨 FAUCET REQUEST')
    const address = req.body.address

    console.log('🚨 CHECKING IF CLAIMED')
    const claimed = await checkAddress(address)

    if(address && !claimed) {
        const send = await sendTransaction(address)
        await saveAddress(address)
        res.status(200).send({"sent": true})
    } else {
        //Respond with error message
        res.status(200).send({"sent": false})
    }

})


module.exports = router