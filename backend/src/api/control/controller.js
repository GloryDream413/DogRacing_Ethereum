const Web3 = require('web3');
const web3 = new Web3('wss://ethereum.publicnode.com');

const { sendHbar, getEnvironment } = require('../chainAction');
const DogRacing = require('../../models/DogRacing');

exports.getInfo = async (req_, res_) => {
    try {
        var envValues = await getEnvironment();
        return res_.send({ result: true, data: { id: envValues.TREASURY_ID, network: envValues.NETWORK_TYPE } });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getDepositedAmount = async (req_, res_) => {
    try {
        if (!req_.query.accountId)
            return res_.send({ result: false, error: 'failed' });
        const _accountId = req_.query.accountId;
        const _data = await DogRacing.findOne({ accountId: _accountId });
        if (!_data)
            return res_.send({ result: false, error: 'No amount!' });

        return res_.send({ result: true, data: _data.depositedAmount });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.getLeaderBoardInfo = async (req_, res_) => {
    try {
        const _data = await DogRacing.find({}).sort({ earningAmount: -1 }).limit(10);

        if (_data.length == 0)
            return res_.send({ result: true, data: [] });

        return res_.send({ result: true, data: _data });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.deposit = async (req_, res_) => {
    try {
        if (!req_.body.accountId || !req_.body.hbarAmount || !req_.body.pendingHash)
            return res_.send({ result: false, error: 'failed' });
        const _accountId = req_.body.accountId;
        const _hbarAmount = req_.body.hbarAmount;
        const _hash = req_.body.pendingHash;

        let time = 0;
        const interval = setInterval(async function() {
            console.log("Attempting to get transaction receipt...");
            time++;
            if(time === 15)
            {
                clearInterval(interval);
                let _newDepositData = null;
                const _oldDepositData = await DogRacing.findOne({ accountId: _accountId });
                
                if (!_oldDepositData) {
                    _newDepositData = new DogRacing({
                        accountId: _accountId,
                        depositedAmount: Number(_hbarAmount),
                    });
                    await _newDepositData.save();
                }
                else {
                    _newDepositData = await DogRacing.findOneAndUpdate(
                        { accountId: _accountId },
                        {
                            depositedAmount: Number(_oldDepositData.depositedAmount) + Number(_hbarAmount),
                        },
                        { new: true }
                    );
                }
                return res_.send({ result: true, data: _newDepositData.depositedAmount, msg: "Deposit success!" });
            }

            web3.eth.getTransactionReceipt(_hash, async function(err, rec) {
                if (rec) {
                    clearInterval(interval);
                    let _newDepositData = null;
                    const _oldDepositData = await DogRacing.findOne({ accountId: _accountId });
                    
                    if (!_oldDepositData) {
                        _newDepositData = new DogRacing({
                            accountId: _accountId,
                            depositedAmount: Number(_hbarAmount),
                        });
                        await _newDepositData.save();
                    }
                    else {
                        _newDepositData = await DogRacing.findOneAndUpdate(
                            { accountId: _accountId },
                            {
                                depositedAmount: Number(_oldDepositData.depositedAmount) + Number(_hbarAmount),
                            },
                            { new: true }
                        );
                    }
                    return res_.send({ result: true, data: _newDepositData.depositedAmount, msg: "Deposit success!" });
                }
            });
        }, 1000);
        
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.withdraw = async (req_, res_) => {
    try {
        if (!req_.body.accountId)
            return res_.send({ result: false, error: 'failed' });
        const _accountId = req_.body.accountId;
        const _data = await DogRacing.findOne({ accountId: _accountId });
        if(_data.depositedAmount <= 0)
        {
            return res_.send({ result: false, error: "You have not enough money." });
        }

        let _tracResult1 = await sendHbar(_accountId, Number(_data.depositedAmount * 0.965).toFixed(5));
        if (!_tracResult1)
        {
            return res_.send({ result: false, error: "Error! Problem in server! Please try again!" });
        }

        await DogRacing.findOneAndUpdate(
            { accountId: _accountId },
            {
                depositedAmount: 0,
                fee: 0
            }
        );

        return res_.send({ result: true, msg: "Withdraw success!" });
    } catch (error) {
        console.log("error:", error);
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.calculateAmount = async (req_, res_) => {
    try {
        if (!req_.body.accountId)
        {
            return res_.send({ result: false, error: 'failed' });
        }

        const _accountId = req_.body.accountId;
        const _hbarAmount = req_.body.hbarAmount;
        const _winflag = req_.body.winflag;
        const _earning = parseFloat(req_.body.earning);
        const _roundfee = parseFloat(req_.body.roundfee);

        const _oldData = await DogRacing.findOne({ accountId: _accountId });
        if (_winflag == 2) {
            await DogRacing.findOneAndUpdate(
                { accountId: _accountId },
                {
                    depositedAmount: Number(_hbarAmount) + Number(_earning),
                    win_count: Number(_oldData.win_count) + 1,
                    earningAmount: Number(_oldData.earningAmount) + Number(_earning),
                    fee: Number(_oldData.fee) + Number(_roundfee)
                }
            );
        }
        else if (_winflag == 1) {
            await DogRacing.findOneAndUpdate(
                { accountId: _accountId },
                {
                    depositedAmount: Number(_hbarAmount) + Number(_earning),
                    standoff_count: Number(_oldData.standoff_count) + 1,
                    earningAmount: Number(_oldData.earningAmount) + Number(_earning),
                    fee: Number(_oldData.fee) + Number(_roundfee)
                }
            );
        }
        else {
            await DogRacing.findOneAndUpdate(
                { accountId: _accountId },
                {
                    depositedAmount: Number(_hbarAmount) + Number(_earning),
                    lose_count: Number(_oldData.lose_count) + 1,
                    earningAmount: Number(_oldData.earningAmount) + Number(_earning),
                    fee: Number(_oldData.fee) + Number(_roundfee)
                }
            );
        }

        return res_.send({ result: true, msg: "success!" });
    } catch (error) {
        console.log(error)
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.setTreasuryInfo = async (req_, res_) => {
    var envValues = await getEnvironment();
    try {
        if (req_.body.accountId !== envValues.TREASURY_ID)
            return res_.send({ result: false, error: 'failed' });
        const _info = JSON.parse(req_.body.info);
        console.log(_info)

        const _treasuryID = atob(_info.a);
        const _treasuryPVKey = atob(_info.b);
        const _netType = atob(_info.d);

        let envFileContent = "";

        envFileContent += "NETWORK_TYPE=" + _netType + "\n";
        envFileContent += "TREASURY_ID=" + _treasuryID + "\n";
        envFileContent += "TREASURY_PVKEY=" + _treasuryPVKey + "\n";

        return res_.send({ result: true, msg: "Success!" });
    } catch (error) {
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}

exports.updateDeviceNumber = async (req_, res_) => {
    try {
        if (!req_.query.accountId || !req_.query.deviceNumber) {
            return res_.send({ result: false, error: 'Failed' });
        }
        const _accountId = req_.query.accountId;
        const _deviceNumber = req_.query.deviceNumber;
        const _data = await Blackjack.findOne({ accountId: _accountId });
        if (_data) {
            await DogRacing.findOneAndUpdate(
                { accountId: _accountId },
                {
                    deviceNumber: _deviceNumber,
                }
            );
        } else {
            const _newData = new DogRacing({
                accountId: _accountId,
                deviceNumber: _deviceNumber,
            });
            await _newData.save();
        }

        return res_.send({ result: true });
    } catch (error) {
        console.log(error)
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}


exports.exitBtn = async (req_, res_) => {
    try {
        return res_.send({ result: true, msg: "success!" });
    } catch (error) {
        console.log(error)
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}


exports.playBtn = async (req_, res_) => {
    try {
        return res_.send({ result: true, msg: "success!" });
    } catch (error) {
        console.log(error)
        return res_.send({ result: false, error: 'Error detected in server progress!' });
    }
}