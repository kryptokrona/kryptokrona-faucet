const fs = require('fs')
const Crypto = require('kryptokrona-crypto').Crypto
const xkr = new Crypto()

const saveAddress = async (address) => {
    const hash = await hashAddress(address)

    fs.readFile('./claimed.json', function (err, data) {
        let json = JSON.parse(data)
        json.push({"hash": hash})

        fs.writeFile('./claimed.json', JSON.stringify(json), () => {
            console.log('🚨 SAVED HASH')
        })
    })
}

const checkAddress = async (address) => {
    const hash = await hashAddress(address)
    const data = fs.readFileSync('./claimed.json')
    const json = JSON.parse(data)
    const claimed = json.find(i => i.hash === hash)

    console.log('🚨 CLAIMED ', !!claimed)
    return !!claimed
}

const getHowManyClaimers = async () => {
    const data = fs.readFileSync('./claimed.json')
    const json = JSON.parse(data)
    return json.length
}

async function hashAddress(address) {
    return await xkr.cn_turtle_lite_slow_hash_v2(toHex(address))
}

function toHex(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return result;
}

module.exports = {saveAddress, checkAddress, getClaimers}