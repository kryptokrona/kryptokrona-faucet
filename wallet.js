const WB = require('kryptokrona-wallet-backend-js')
const fs = require('fs')
const fetch = require('cross-fetch')

const WALLET_NAME = 'faucet'
const WALLET_PASSWORD = 'faucet123'
const NODE = process.env.NODE || 'localhost'
const PORT = Number(process.env.PORT) || 11898
const BACKUP_NODES = process.env.BACKUP_NODES || ''
const AMOUNT_TO_SEND = 500000

let wallet
let daemon

const parseNode = node => {
    const normalized = node.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const [host, port] = normalized.split(':')

    return {
        host,
        port: Number(port) || PORT
    }
}

const shuffle = nodes => {
    for (let i = nodes.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [nodes[i], nodes[j]] = [nodes[j], nodes[i]]
    }

    return nodes
}

const getDaemonCandidates = () => {
    const primary = [{host: NODE, port: PORT}]
    const backups = BACKUP_NODES
        .split(',')
        .map(parseNode)
        .filter(node => node.host)

    return primary.concat(shuffle(backups))
}

const isDaemonAvailable = async node => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
        const response = await fetch(`http://${node.host}:${node.port}/info`, {
            signal: controller.signal
        })

        return response.ok
    } catch (err) {
        console.log(`Daemon ${node.host}:${node.port} unavailable: ${err.message}`)
        return false
    } finally {
        clearTimeout(timeout)
    }
}

const initDaemon = async () => {
    const candidates = getDaemonCandidates()

    for (const node of candidates) {
        if (await isDaemonAvailable(node)) {
            console.log(`Using daemon ${node.host}:${node.port}`)
            daemon = new WB.Daemon(node.host, node.port)
            return
        }
    }

    const nodes = candidates.map(node => `${node.host}:${node.port}`).join(', ')
    throw new Error(`No daemon available. Checked: ${nodes}`)
}

const logIntoWallet = async () => {
    const [wallet, error] = await WB.WalletBackend.openWalletFromFile(daemon, `${WALLET_NAME}.wallet`, WALLET_PASSWORD);
    if (error) {
        console.log('Failed to open wallet: ' + error.toString());
    }
    return wallet
}

const startWallet = async () => {
    //Start sync process
    wallet = await logIntoWallet()

    await wallet.start();

    wallet.enableAutoOptimization(false)
    const [walletBlockCount, localDaemonBlockCount, networkBlockCount] = wallet.getSyncStatus();

    if (walletBlockCount === 0) {
        await wallet.reset(networkBlockCount - 100)
    }

    wallet.on('heightchange', async (walletBlockCount, localDaemonBlockCount, networkBlockCount) => {
        console.log('SYNC: ' + walletBlockCount, 'local: ' + localDaemonBlockCount, 'network: ' + networkBlockCount)
        console.log('BALANCE: ' + await wallet.getBalance())

        console.log('SAVING WALLET')
        const saved = wallet.saveWalletToFile(`${WALLET_NAME}.wallet`, WALLET_PASSWORD)

        if (!saved) {
            console.log('Failed to save wallet!');
        }
    })
}

const initWallet = async () => {
    try {
        await initDaemon()

        //Creates a wallet if we don't have one
        if (!(fs.existsSync('./faucet.wallet'))) {
            console.log('Creating wallet')
            const wallet = await WB.WalletBackend.createWallet(daemon);

            console.log('Saving wallet')
            const saved = wallet.saveWalletToFile(`${WALLET_NAME}.wallet`, WALLET_PASSWORD)

            if (!saved) {
                console.log('Failed to save wallet!');
            }
        }
        //Creates a .json file to save claimers in
        if (!(fs.existsSync('./claimed.json'))) {
            fs.writeFile('claimed.json', '[]', function (err) {
                if (err) throw err;
                console.log('File is created successfully.');
            });
        }

        //Start wallet
        await startWallet()

    } catch (err) {
        console.error(err)
    }
}

const getWalletInfo = async () => {
    let balance = await wallet.getBalance()
    let address = wallet.getPrimaryAddress()
    return {balance, address}
}

const sendTransaction = async (address) => {

    try {
        await optimizeMessages()

        return await wallet.sendTransactionAdvanced(
            [[address, AMOUNT_TO_SEND]],
            3,
            {fixedFee: 10000, isFixedFee: true},
        );

    } catch (err) {
        console.log('Error', err);
    }
}

const optimizeMessages = async nbrOfTxs => {
    console.log('optimize');
    try {

        const [walletHeight, localHeight, networkHeight] = wallet.getSyncStatus();
        let inputs = await wallet.subWallets.getSpendableTransactionInputs(wallet.subWallets.getAddresses(), networkHeight);
        if (inputs.length > 8) {
            console.log('enough inputs');
            return;
        }
        let subWallets = wallet.subWallets.subWallets

        subWallets.forEach((value, name) => {
            let txs = value.unconfirmedIncomingAmounts.length;

            if (txs > 0) {
                console.log('Already have incoming inputs, aborting..');
            }
        })

        let payments = [];
        let i = 0;
        /* User payment */
        while (i < nbrOfTxs - 1 && i < 10) {
            payments.push([
                wallet.subWallets.getAddresses()[0],
                500000
            ]);

            i += 1;

        }

        let result = await wallet.sendTransactionAdvanced(
            payments, // destinations,
            3, // mixin
            {fixedFee: 10000, isFixedFee: true}, // fee
            undefined, //paymentID
            undefined, // subWalletsToTakeFrom
            undefined, // changeAddress
            true, // relayToNetwork
            false, // sendAll
            undefined
        );

        console.log('optimize completed');
        return result;


    } catch (err) {
        console.log('error optimizer', err);
    }

}

module.exports = {initWallet, sendTransaction, getWalletInfo}
