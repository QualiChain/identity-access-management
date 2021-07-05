const express = require('express');
const router = express.Router();
const ba_logger = require('../log/ba_logger');
const UtilsRoutes = require('./utils-routes');
const passport = require("passport");
const crypto = require('crypto');
const Web3 = require('web3');
const web3 = new Web3('https://ropsten.infura.io/v3/66a470c1158f441cac9c502cd63d4b9b');
const consortiumAddress = '0xA6B9A8bD75a586e5d713C23682cF0fb252aD0Cff';
const consortiumABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":false,"inputs":[{"internalType":"address","name":"id","type":"address"},{"internalType":"uint256","name":"vote","type":"uint256"}],"name":"cancelHEI","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"vote","type":"uint256"}],"name":"changeThreshold","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"id","type":"address"}],"name":"getHEI","outputs":[{"internalType":"address","name":"add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPollingInfo","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"id","type":"address"},{"internalType":"address","name":"contractAddress","type":"address"}],"name":"registerFounderHEI","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"id","type":"address"},{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256","name":"vote","type":"uint256"}],"name":"registerHEI","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const consortiumContract = new web3.eth.Contract(consortiumABI,consortiumAddress);
const issuerContractABI = [{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"revokeCertificate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"verifyCertificate","outputs":[{"name":"hash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"hash","type":"bytes32"}],"name":"registerCertificate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
const fs = require('fs');
const Transaction = require('ethereumjs-tx').Transaction;
const ecdsaSign = require('secp256k1');
const IPFS = require('ipfs');
let IPFSNode = null;

const account = '0x2CefB619218825C0c670D8E77f7039e0693E1dDC';
const privateKey = Buffer.from('26020431000baecb5e0ae79cc2fca00a8c4ce6e299889dcaa3a12b469383f2b5', 'hex');
const contractAddress = '0xc2C6789CbdA002E2607296e6e22a827B1C11B0F5';
const contractABI = [{'constant': false, 'inputs': [{'name': 'id', 'type': 'uint256'}], 'name': 'revokeCertificate', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': 'id', 'type': 'uint256'}], 'name': 'verifyCertificate', 'outputs': [{'name': 'hash', 'type': 'bytes32'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': 'id', 'type': 'uint256'}, {'name': 'hash', 'type': 'bytes32'}], 'name': 'registerCertificate', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'inputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor'}];
const contract = new web3.eth.Contract(contractABI, contractAddress);

let txCount = 0;

router.post('/validateCertificate', /*passport.authenticate('jwt', {session: false}),*/ async (req, res) => {
    try {
        ba_logger.ba("BA|QUALICHAIN-RECRUITING|VALIDATE|INCOMING-REQUEST|");
        //req.fields contains non-file fields
        //req.files contains files
        console.log(req.fields)
        const certificate = req.files.certificate;

        //hash should be 0x914b093409966e41c308ffefb3c6f607afef01d29c63ae6f29585d3dc815df7b
        const did = req.fields.did;
        const civilId = req.fields.civilId;

        if (Object.keys(req.fields.did).length === 0)    {
            UtilsRoutes.replyFailure(res,'Information missing',"Please input the DID");
            return false;
        }

        if (Object.keys(req.fields.civilId).length === 0)    {
            UtilsRoutes.replyFailure(res,'Information missing',"Please input the civilId");
            return false;
        }

        if (Object.keys(req.files).length === 0)    {
            UtilsRoutes.replyFailure(res,'Certificate missing',"Please input the Certificate");
            return false;
        }
        let fileBytes = fs.readFileSync(certificate.path);
        console.log("fileBytes")
        console.log(fileBytes)
        var hashFunction = crypto.createHash('sha256');
        hashFunction.update(fileBytes);
        var bytes = hashFunction.digest();
        var hashBytes = '0x' + bytes.toString('hex');
        console.log(hashBytes)

        consortiumContract.methods.getHEI(did).call((consortiumErr,issuerContractAddress) => {
            console.log(issuerContractAddress);
            if(consortiumErr == null && issuerContractAddress != '0x0') {
                const issuerContract = new web3.eth.Contract(issuerContractABI,issuerContractAddress);
                issuerContract.methods.verifyCertificate(civilId).call((err,certificateHash) => {
                    console.log("CERTIFICATE HASH");
                    console.log(certificateHash)
                    if(err == null) {
                        if (hashBytes == certificateHash) {
                            ba_logger.ba("BA|QUALICHAIN-RECRUITING|SUCCESS-VALIDATE|" + certificateHash);
                            UtilsRoutes.replySuccess(res, certificateHash, "Successful certificate verification");
                        } else {
                            let hashDiffers = 'Uploaded document hash, ' + hashBytes + ' differs from stored hash: ' + certificateHash;
                            UtilsRoutes.replyFailure(res, hashDiffers, "Verification failure. The hash of the provided document does not correspond to the stored hash");
                        }
                    }   else    {
                            UtilsRoutes.replyFailure(res,'',"Issuer ID does not match any contract");
                        }
                });
            }  else if(issuerContractAddress == '0x0000000000000000000000000000000000000000000000000000000000000000\n') {
                UtilsRoutes.replyFailure(res,'',"Issuer ID does not match any contract. Contract address:", issuerContractAddress);
            }   else    {
                console.log("aqui")
                console.log(consortiumErr)
                UtilsRoutes.replyFailure(res,consortiumErr,"Verification failure. Try again");
            }
        });
    } catch (e) {
        ba_logger.ba("BA|QUALICHAIN-RECRUITING|VALIDATE|ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/validateCertificateAuth', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        ba_logger.ba(`BA|QUALICHAIN-RECRUITING|VALIDATE|INCOMING-REQUEST|USER ${req.user.username}`);
        //req.fields contains non-file fields
        //req.files contains files
        console.log(req.fields)
        const certificate = req.files.certificate;

        //hash should be 0x914b093409966e41c308ffefb3c6f607afef01d29c63ae6f29585d3dc815df7b
        const did = req.fields.did;
        const civilId = req.fields.civilId;

        if (Object.keys(req.fields.did).length === 0)    {
            UtilsRoutes.replyFailure(res,'Information missing',"Please input the DID");
            return false;
        }

        if (Object.keys(req.fields.civilId).length === 0)    {
            UtilsRoutes.replyFailure(res,'Information missing',"Please input the civilId");
            return false;
        }

        if (Object.keys(req.files).length === 0)    {
            UtilsRoutes.replyFailure(res,'Certificate missing',"Please input the Certificate");
            return false;
        }
        let fileBytes = fs.readFileSync(certificate.path);
        console.log("fileBytes")
        console.log(fileBytes)
        var hashFunction = crypto.createHash('sha256');
        hashFunction.update(fileBytes);
        var bytes = hashFunction.digest();
        var hashBytes = '0x' + bytes.toString('hex');
        console.log(hashBytes)

        consortiumContract.methods.getHEI(did).call((consortiumErr,issuerContractAddress) => {
            console.log(issuerContractAddress);
            if(consortiumErr == null && issuerContractAddress != '0x0') {
                const issuerContract = new web3.eth.Contract(issuerContractABI,issuerContractAddress);
                issuerContract.methods.verifyCertificate(civilId).call((err,certificateHash) => {
                    console.log("CERTIFICATE HASH");
                    console.log(certificateHash)
                    if(err == null) {
                        if (hashBytes == certificateHash) {
                            UtilsRoutes.replySuccess(res, certificateHash, "Successful certificate verification");
                        } else {
                            let hashDiffers = 'Uploaded document hash, ' + hashBytes + ' differs from stored hash: ' + certificateHash;
                            UtilsRoutes.replyFailure(res, hashDiffers, "Verification failure. The hash of the provided document does not correspond to the stored hash");
                        }
                    }   else    {
                        UtilsRoutes.replyFailure(res,'',"Issuer ID does not match any contract");
                    }
                });
            }  else if(issuerContractAddress == '0x0000000000000000000000000000000000000000000000000000000000000000\n') {
                UtilsRoutes.replyFailure(res,'',"Issuer ID does not match any contract. Contract address:", issuerContractAddress);
            }   else    {
                console.log("aqui")
                console.log(consortiumErr)
                UtilsRoutes.replyFailure(res,consortiumErr,"Verification failure. Try again");
            }
        });
    } catch (e) {
        ba_logger.ba(`BA|QUALICHAIN-RECRUITING|VALIDATE|ERROR|USER ${req.user.username}`);
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/registerCertificate', /*passport.authenticate('jwt', {session: false}),*/ async (req, res) => {
    try {
        ba_logger.ba(`BA|QUALICHAIN-RECRUITING|REGISTER|INCOMING-REQUEST`);

        const certificate = req.files.certificate;
        let fileBytes = fs.readFileSync(certificate.path);

        await web3.eth.getTransactionCount(account, 'pending', (err, count) => {
            txCount = count;
        });

        const hashFunction = crypto.createHash('sha256');
        hashFunction.update(fileBytes);
        const hash = hashFunction.digest();

        const numberId = Number(req.fields.civilId);
        if (isNaN(numberId)) {
            throw new Error('The name of the certificate should contain only integers, and end in .pdf');
        }

        const hashBytes = '0x' + hash.toString('hex');

        const data = contract.methods.registerCertificate(numberId, hashBytes).encodeABI();

        const accountNonce = '0x' + (txCount).toString(16);

        const txObject = {
            nonce: accountNonce,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
            from: account,
            to: contractAddress,
            data: data,
            chainId: await web3.eth.net.getId()
        };

        const tx = new Transaction(txObject, { chain: 'ropsten' });
        tx.sign(privateKey);
        const serializedTx = tx.serialize();

        const txData = '0x' + serializedTx.toString('hex');

        txCount++;

        web3.eth.sendSignedTransaction(txData, (err, txHash) => {
            if (err == null) {
                ba_logger.ba('Transaction hash: ', txHash);
                registerIPFS(certificate.path, fileBytes);
                UtilsRoutes.replySuccess(res, txHash, "Successful certificate registration");
            } else {
                ba_logger.ba(err);
                UtilsRoutes.replyFailure(res, err,"Registration Failed");
            }
        });
    } catch (e) {
        ba_logger.ba(`BA|QUALICHAIN-RECRUITING|REGISTER|ERROR`);
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/registerCertificateAuth', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        ba_logger.ba(`BA|QUALICHAIN-RECRUITING|REGISTER|INCOMING-REQUEST|USER ${req.user.username}`);

        const certificate = req.files.certificate;
        let fileBytes = fs.readFileSync(certificate.path);

        await web3.eth.getTransactionCount(account, 'pending', (err, count) => {
            txCount = count;
        });

        const hashFunction = crypto.createHash('sha256');
        hashFunction.update(fileBytes);
        const hash = hashFunction.digest();

        const numberId = Number(req.fields.civilId);
        if (isNaN(numberId)) {
            throw new Error('The name of the certificate should contain only integers, and end in .pdf');
        }

        const hashBytes = '0x' + hash.toString('hex');

        const data = contract.methods.registerCertificate(numberId, hashBytes).encodeABI();

        const accountNonce = '0x' + (txCount).toString(16);

        const txObject = {
            nonce: accountNonce,
            gasLimit: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
            from: account,
            to: contractAddress,
            data: data,
            chainId: await web3.eth.net.getId()
        };

        const tx = new Transaction(txObject, { chain: 'ropsten' });
        tx.sign(privateKey);
        const serializedTx = tx.serialize();

        const txData = '0x' + serializedTx.toString('hex');

        txCount++;

        web3.eth.sendSignedTransaction(txData, (err, txHash) => {
            if (err == null) {
                ba_logger.ba('Transaction hash: ', txHash);
                registerIPFS(certificate.path, fileBytes);
                UtilsRoutes.replySuccess(res, txHash, "Successful certificate registration");
            } else {
                ba_logger.ba(err);
                UtilsRoutes.replyFailure(res, err,"Registration Failed");
            }
        });
    } catch (e) {
        ba_logger.ba(`BA|QUALICHAIN-RECRUITING|REGISTER|ERROR|USER ${req.user.username}`);
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

async function registerIPFS(path, fileBytes) {
    if(IPFSNode == null) {
        IPFSNode = await IPFS.create({ silent: true });
    }

    try {
        const result = await IPFSNode.add(fileBytes);
        ba_logger.ba('Added file: ', path, ' Multihash: ', result["path"]);

    } catch (error) {
        ba_logger.ba(error);
    }
}

module.exports = router;