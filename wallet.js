const WB = require('kryptokrona-wallet-backend-js')
const fs = require('fs')

const WALLET_NAME = 'faucet'
const WALLET_PASSWORD = 'faucet123'
const NODE = 'localhost'
const PORT = 11898
const AMOUNT_TO_SEND = 500000
const daemon = new WB.Daemon(NODE, PORT)

let wallet

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
