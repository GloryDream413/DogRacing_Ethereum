/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { css } from '@emotion/react'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socketIO from 'socket.io-client';

import {
    CircularProgress,
    Backdrop,
    Dialog,
    Modal
} from '@mui/material';

import AboutDlg from '../components/MainMenu/AboutDlg';
import LeaderBoardDlg from "../components/LeaderBoardDlg";
import SettingDlg from "../components/SettingDlg";
import StatDlg from "../components/StatDlg";
import { getRequest, postRequest } from "../api/apiRequests";

import * as env from "../env";
const socket = socketIO.connect(env.SERVER_URL);


function Home() {
    const [netType, setNetType] = useState("");
    const [open, setOpen] = React.useState(false);
    const [inputAccountId, setInputAccountId] = useState("");
    const [loadingView, setLoadingView] = useState(false);
    const [toastStrInputValue, setToastStrInputValue] = useState("");
    const [treasuryInfo, setTreasuryInfo] = useState(false);
    const [statDlgViewFlag, setStatDlgViewFlag] = useState(false);
    const [money, setMoney] = useState(0);
    const [type, setType] = useState("deposit");
    const [totalHbarAmount, setTotalHbarAmount] = useState(0);
    const [aboutDlgViewFlag, setAboutDlgViewFlag] = useState(false);
    const [leaderBoardDlgViewFlag, setLeaderBoardDlgViewFlag] = useState(false);
    const [settingDlgViewFlag, setSettingDlgViewFlag] = useState(false);
    const [message, setMessage] = useState ('')
    const [walletId, setWalletId] = useState(null)
    const [pending, setPending] = useState(false);

    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const account = useAccount();

    useEffect(() => {
        if (account.address)
        {
            setWalletId(account.address);
        }
    }, [account.status, account.address])

    useEffect(() => {
        getInfo ();
    }, []);

    useEffect(() => {
        socket.on('messageResponse', (data) => {
            if (socket.id !== data.socketID){
                setMessage(data.text);
            }
        });
    }, [socket, message]);

    useEffect(() => {
        if (message.length > 0) toast.info (message);
    }, [message]);

    useEffect(() => {
        if (walletId != null) {
            getInfo();
            getDepositedAmount();
            setInputAccountId(walletId);
            setTimeout(createEvent, 1000);
        }
    }, [walletId]);

    useEffect(() => {
        document.getElementById("money").click();
    }, [money]);

    useEffect(() => {
        document.getElementById("treasury").click();
    }, [treasuryInfo]);

    const getInfo = async () => {
        setLoadingView(true);
        const _res = await getRequest(env.SERVER_URL + "/api/control/get_info");
        if (!_res) {
            toast.error("Something wrong with server!");
            setLoadingView(false);
            return;
        }
        if (!_res.result) {
            toast.error("No info!");
            setLoadingView(false);
            return;
        }

        if (_res.data.id !== undefined && _res.data.id === walletId){
            setTreasuryInfo(true);
        }
        localStorage.setItem ("NETTYPE", _res.data.network);
        localStorage.setItem ("TREASURY_ID", _res.data.id);

        setNetType(_res.data.network);
        setLoadingView(false);
    }

    const getDepositedAmount = async () => {
        document.getElementById("money").click();
        setLoadingView(true);

        const _res = await getRequest(env.SERVER_URL + "/api/control/get_deposited_amount?accountId=" + walletId);
        if (!_res) {
            toast.error("Something wrong with server!");
            setLoadingView(false);
            return;
        }
        if (!_res.result) {
            setMoney(0);
            setLoadingView(false);
            return;
        }

        setMoney(Number(_res.data.toFixed(3)) - parseFloat(document.getElementById("startround").getAttribute("betamount")));
        setLoadingView(false);
    }

    const changeToRealValue = (value_, decimal_) => {
        return parseFloat(value_ / (10 ** decimal_)).toFixed(3);
    }

    const playBtn = async () => {
        toast.error("You are already running this game");
    }

    const getWalletBalance = async () => {
        setLoadingView(true);
        let g_hbarBalance = 0;
        let mnu = "";
        if (localStorage.getItem("NETTYPE").trim() == "mainnet") 
        mnu = "https://api.etherscan.io/api?module=account&action=balance&address="+ walletId +"&tag=latest&apikey=FAQHXR8Q49UY22ZRVPCNQFTMI5IBV8Z5XT";
        else
            mnu = "https://api-goerli.etherscan.io/api?module=account&action=balance&address="+ walletId +"&tag=latest&apikey=FAQHXR8Q49UY22ZRVPCNQFTMI5IBV8Z5XT";
        let g_hbarBalanceInfo = await getRequest(mnu);
        console.log(g_hbarBalanceInfo);
        if (!g_hbarBalanceInfo || g_hbarBalanceInfo.balances?.status === 0) {
            g_hbarBalance = 0;
        }
        else {
            g_hbarBalance = (Number(g_hbarBalanceInfo.result) / (10 ** 18)).toFixed(3);
        }
        console.log("balance", g_hbarBalance);
        setTotalHbarAmount(g_hbarBalance);
        setLoadingView(false);
    }

    const createEvent = () => {
        document.getElementById("walletId").click();
        document.getElementById("money").click();
    }

    const onConnectWallet = () => {
        try {
            setPending(true);
            connect({ connector: connectors[0] });
            setPending(false);
            setOpen(false);
            document.getElementById("treasury").click();
        } catch (e) {
            console.log("Connecting wallet...", e);
            setPending(false);
        }
    }

    const onDisconnectWallet = () => {
        try {
            setPending(true);
            setWalletId('');
            disconnect();
            setPending(false);
        } catch (e) {
            console.log("Disconnecting wallet...", e);
            setPending(false);
        }
    }

    const onGoToLeaderBoard = async () => {
        setLeaderBoardDlgViewFlag(true);
    }

    const onDeposit = async () => {
        setType("deposit");
        await getWalletBalance();
        setAboutDlgViewFlag(true);
    }

    const onWithdraw = async () => {
        const hbarAmount_ = Number(document.getElementById("withdraw").value).toFixed(3);

        if (hbarAmount_ > 0) {
            setLoadingView(true);
            const _res = await postRequest(env.SERVER_URL + "/api/control/withdraw", { accountId: walletId, hbarAmount: hbarAmount_ });
            
            if (!_res) {
                toast.error("Something wrong with server!");
                setLoadingView(false);
                return;
            }
            if (!_res.result) {
                if(_res.error === "You have not enough money.")
                {
                    setMoney(0);
                }
                toast.error(_res.error);
                setLoadingView(false);
                return;
            }
            toast.success(_res.msg);
            setMoney(0);
            setLoadingView(false);
        }
    }

    const onGoToSetting = async () => {
        setSettingDlgViewFlag(true);
    }

    const onEndRound = async () => {
        const _hbarAmount = document.getElementById("money").value;
        const _winflag = document.getElementById("endround").getAttribute("winflag");
        const _earning = document.getElementById("endround").getAttribute("earning");
        const _roundfee = document.getElementById("endround").getAttribute("roundfee");
        const money = parseFloat(_hbarAmount) + parseFloat(_earning);
        setMoney(money);

        if (walletId !== undefined) {
            const _res = await postRequest(env.SERVER_URL + "/api/control/end_round", { accountId: walletId, hbarAmount: _hbarAmount, winflag: _winflag, earning: _earning, roundfee: _roundfee });
            if (!_res) {
                toast.error("Something wrong with server!");
                setLoadingView(false);
                await getDepositedAmount();
                return;
            }
            if (!_res.result) {
                toast.error(_res.error);
                setLoadingView(false);
                await getDepositedAmount();
                return;
            }
        }
    }

    const onStartRound = async () => {
        setLoadingView(false);
        await getDepositedAmount();
    }

    const toastAlert = () => {
        var toastStr = document.getElementById("toastStrInput").value;
        var toastFlg = Number(document.getElementById("toastStrInput").getAttribute('toastflg'));
        if (toastFlg == 0) {
            toast.success(toastStr);
        } else if (toastFlg == 1) {
            toast.error(toastStr);
        } else if (toastFlg == 2) {
            toast.warning(toastStr);
        } else if (toastFlg == 3) {
            toast.info(toastStr);
        }
    }

    return (
        <div>
            <ToastContainer autoClose={5000} draggableDirection="x" />
            <Dialog open={aboutDlgViewFlag} scroll='body' css={dialogStyle}>
                <AboutDlg
                    totalHbarAmount={totalHbarAmount}
                    type={type}
                    onDeposit={async (hbarAmount_) => {
                        setAboutDlgViewFlag(false);
                        setLoadingView(true);

                        //const _approveResult = await sendHbarToTreasury(hbarAmount_);
                        const _approveResult = true;

                        if (!_approveResult) {
                            setLoadingView(false);
                            toast.error("Something wrong with approve!");
                            return false;
                        }

                        const _res = await postRequest(env.SERVER_URL + "/api/control/deposit", { accountId: walletId, hbarAmount: hbarAmount_ });
                        if (!_res) {
                            toast.error("Something wrong with server!");
                            setLoadingView(false);
                            return;
                        }
                        if (!_res.result) {
                            toast.error(_res.error);
                            setLoadingView(false);
                            return;
                        }
                        toast.success(_res.msg);
                        setMoney(parseInt(_res.data, 10));
                        setLoadingView(false);
                    }}
                    onCancel={() => {
                        setAboutDlgViewFlag(false);
                    }}
                />
            </Dialog>
            <Dialog
                open={leaderBoardDlgViewFlag}
                maxWidth='md'
                css={dialogStyle}
            >
                <LeaderBoardDlg
                    onOK={() => setLeaderBoardDlgViewFlag(false)}
                />
            </Dialog>
            <Dialog
                open={settingDlgViewFlag}
                fullWidth={true}
                scroll='body'
                maxWidth='md'
                css={dialogStyle}
            >
                <SettingDlg
                    onSet={async (info_) => {
                        setLoadingView(true);
                        const _res = await postRequest(env.SERVER_URL + "/api/control/set", { accountId: walletId, info: JSON.stringify(info_) });
                        if (!_res) {
                            toast.error("Something wrong with server!");
                            setLoadingView(false);
                            return;
                        }
                        if (!_res.result) {
                            toast.error(_res.error);
                            setLoadingView(false);
                            return;
                        }
                        toast.success(_res.msg);
                        setLoadingView(false);
                        let alertMsg = ""
                        alertMsg = `Network is changed to ${atob(info_.d)}. Please disconnect your wallet and refresh your browser!`
                        setSettingDlgViewFlag(false)
                        socket.emit('message', {
                            text: alertMsg,
                            socketID: socket.id,
                          });
                    }}
                    onCancel={() => setSettingDlgViewFlag(false)}
                    nettype={netType}
                />
            </Dialog>
            <Dialog
                open={statDlgViewFlag}
                fullWidth={true}
                maxWidth='md'
                css={dialogStyle}
            >
                <StatDlg
                    onOK={() => setStatDlgViewFlag(false)}
                />
            </Dialog>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loadingView}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <div  hidden>
                <button id="leaderBoard" onClick={() => onGoToLeaderBoard()} />
                <button id="connectWallet" onClick={() => { onConnectWallet(); }} />
                <button id="disconnectWallet" onClick={() => { onDisconnectWallet(); }} />
                <button id="toastAlertBtn" onClick={() => { toastAlert(); }} />
                <input id="walletId" value={inputAccountId} onChange={(e) => setInputAccountId(e.target.value)} />
                <button id="setting" onClick={() => onGoToSetting()} />
                <button id="deposit" value={0} onClick={onDeposit} />
                <button id="withdraw" value={0} onClick={onWithdraw} />
                <button id="stats" onClick={() => setStatDlgViewFlag(true)} hidden />
                <button id="playBtn" onClick={() => playBtn()} hidden />
                <button id="endround" onClick={onEndRound} winflag="0" earning="0" roundfee="0" />
                <button id="startround" onClick={onStartRound} betamount={0} />
                <input id="toastStrInput" toastflg="0" value={toastStrInputValue} onChange={(e) => setToastStrInputValue(e.target.value)} /> {/* 0: success, 1: error, 2: warning, 3: info */}
                <input id="money" value={money} onChange={(e) => setMoney(e.target.value)} />
                <input id="betAmount" value={0} onChange={() => console.log("start racing...")} />
                <input id="treasury" value={treasuryInfo} onChange={(e) => setTreasuryInfo(e.target.value)} />
            </div>
        </div>
    )
}

const dialogStyle = css`
    .MuiPaper-root {
        background: transparent;
        overflow-y: visible;
    }
`
export default Home;