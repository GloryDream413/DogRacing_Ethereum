require('dotenv').config('../../../env');
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3('wss://ethereum-goerli.publicnode.com');

exports.getEnvironment = async () => {
  try {
      let inputD = await fs.promises.readFile('.env', 'utf8');
      if (inputD == undefined || inputD == null) return {};
      let tid = "";
      let pvkey = "";
      let lid = "";
      content = inputD.toString();
      var pams = content.split("\n");
      for (pam of pams) {
        var t = pam.split("=")
        if (t[0].trim() == "TREASURY_ID") tid = t[1].trim();
        if (t[0].trim() == "TREASURY_PVKEY") pvkey = t[1].trim();
        if (t[0].trim() == "LOYALTY_ID") lid = t[1].trim();
      }

      return {
        TREASURY_ID: tid,
        TREASURY_PVKEY: pvkey,
        LOYALTY_ID: lid
      }
  } catch (error) {
    throw error;
  }
}

exports.sendHbar = async (receiverId, amount) => {
  var envValues = await this.getEnvironment();

  try {
    const account = web3.eth.accounts.privateKeyToAccount(envValues.TREASURY_PVKEY);
    console.log("Account:", account);

    const txObject = {
      from: account.address,
      to: receiverId,
      value: web3.utils.toWei(String(amount), 'ether'),
      gas: 21000
    };

    web3.eth.accounts.signTransaction(txObject, account.privateKey)
    .then(signedTx => {
      web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    })
    .then(receipt => {
      console.log('Transaction receipt:', receipt);
      return false;
    });
    return true;
  } catch (error) {
    console.log(error)
    return false;
  }
}