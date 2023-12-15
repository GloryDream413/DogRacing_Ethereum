require('dotenv').config('../../../env');
const fs = require('fs');
const {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  TransactionId,
  TransferTransaction,
  TokenAssociateTransaction,
  Hbar,
  NftId,
  AccountAllowanceApproveTransaction,
} = require('@hashgraph/sdk');

const axios = require('axios');

const HBAR_DECIMAL = 100000000;
const PAL_TOKEN_ID = '0.0.1182820'
const palDecimals = 8;

// const operatorId = AccountId.fromString(process.env.TREASURY_ID);
// const operatorKey = PrivateKey.fromString(process.env.TREASURY_PVKEY);
// const client = Client.forTestnet().setOperator(operatorId, operatorKey);
//const client = Client.forMainnet().setOperator(operatorId, operatorKey);
/*
const supplyKey = PrivateKey.fromString(process.env.SUPPLY_KEY);
const tokenId = TokenId.fromString(process.env.TOKEN_ID);
*/

exports.getEnvironment = async () => {
  try {
      let inputD = await fs.promises.readFile('.env', 'utf8');

      if (inputD == undefined || inputD == null) return {};
      let nettype = "";
      let tid = "";
      let pvkey = "";
      let lid = "";
      content = inputD.toString();
      var pams = content.split("\n");
      for (pam of pams) {
        var t = pam.split("=")
        if (t[0].trim() == "NETWORK_TYPE") nettype = t[1].trim();
        if (t[0].trim() == "TREASURY_ID") tid = t[1].trim();
        if (t[0].trim() == "TREASURY_PVKEY") pvkey = t[1].trim();
        if (t[0].trim() == "LOYALTY_ID") lid = t[1].trim();
      }

      return {
        NETWORK_TYPE: nettype,
        TREASURY_ID: tid,
        TREASURY_PVKEY: pvkey,
        LOYALTY_ID: lid
      }
  } catch (error) {
    throw error;
  }
}

exports.getAllowance = async (_accountId, _amount) => {
  var envValues = await this.getEnvironment();
  const operatorId = AccountId.fromString(envValues.TREASURY_ID);
  try {
    const _response = await axios.get(`https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${_accountId}/allowances/crypto`);
    let _allowanceCheck = false;
    if (_response && _response.data.allowances && _response.data.allowances?.length > 0) {
      const _allowanceInfo = _response.data.allowances;
      console.log(_allowanceInfo);
      for (let i = 0; i < _allowanceInfo.length; i++) {
        if (_allowanceInfo[i].spender === operatorId.toString() && _allowanceInfo[i].amount_granted >= _amount * HBAR_DECIMAL) {
          _allowanceCheck = true;
          break;
        }
      }
    }
    if (!_allowanceCheck)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}

exports.receiveAllowanceHbar = async (sender, hbarAmount) => {
  var envValues = await this.getEnvironment();
  const operatorKey = PrivateKey.fromString(envValues.TREASURY_PVKEY);
  const operatorId = AccountId.fromString(envValues.TREASURY_ID);
  let client;
  if (envValues.NETWORK_TYPE == "testnet")
    client = Client.forTestnet().setOperator(operatorId, operatorKey);
  else
    client = Client.forMainnet().setOperator(operatorId, operatorKey);
  try {
    const sendHbarBal = new Hbar(hbarAmount); // Spender must generate the TX ID or be the client

    const nftSendTx = new TransferTransaction()
      .addApprovedHbarTransfer(AccountId.fromString(sender), sendHbarBal.negated())
      .addHbarTransfer(operatorId, sendHbarBal);

    nftSendTx.setTransactionId(TransactionId.generate(operatorId)).freezeWith(client);
    const nftSendSign = await nftSendTx.sign(operatorKey);
    const nftSendSubmit = await nftSendSign.execute(client);
    const nftSendRx = await nftSendSubmit.getReceipt(client);
    if (nftSendRx.status._code != 22)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}

exports.sendHbar = async (receiverId, amount) => {
  var envValues = await this.getEnvironment();
  const operatorKey = PrivateKey.fromString(envValues.TREASURY_PVKEY);
  const operatorId = AccountId.fromString(envValues.TREASURY_ID);
  let client;
  if (envValues.NETWORK_TYPE == "testnet")
    client = Client.forTestnet().setOperator(operatorId, operatorKey);
  else
    client = Client.forMainnet().setOperator(operatorId, operatorKey);
  console.log('sendHbar log - 1 : ', receiverId, amount);
  const sendHbarBal = new Hbar((amount * 95 / 100).toFixed(3)); // Spender must generate the TX ID or be the client

  try {
    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, sendHbarBal.negated())
      .addHbarTransfer(AccountId.fromString(receiverId), sendHbarBal)
      .freezeWith(client)
      .sign(operatorKey);
    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);

    if (transferRx.status._code !== 22)
      return false;

    return true;
  } catch (error) {
    console.log(error)
    return false;
  }
}

exports.setAssociate = async (tokenId) => {
  var envValues = await this.getEnvironment();
  const operatorKey = PrivateKey.fromString(envValues.TREASURY_PVKEY);
  const operatorId = AccountId.fromString(envValues.TREASURY_ID);
  let client;
  if (envValues.NETWORK_TYPE == "testnet")
    client = Client.forTestnet().setOperator(operatorId, operatorKey);
  else
    client = Client.forMainnet().setOperator(operatorId, operatorKey);
  console.log("setAssociate log - 1 : ", tokenId);
  try {
    const checkingTokenId = tokenId;
    //Associate a token to an account and freeze the unsigned transaction for signing
    const transaction = await new TokenAssociateTransaction()
      .setAccountId(operatorId)
      .setTokenIds([TokenId.fromString(checkingTokenId)])
      .freezeWith(client);

    const signTx = await transaction.sign(operatorKey);
    const txResponse = await signTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const transactionStatus = receipt.status;
    console.log("transactionStatus log", `Associate ${transactionStatus.toString()}!`);
    return true;
  } catch (error) {
    return false;
  }
}
