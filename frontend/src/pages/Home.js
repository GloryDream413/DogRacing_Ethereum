/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import { css } from '@emotion/react'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socketIO from 'socket.io-client';

import {
    CircularProgress,
    Backdrop,
    Dialog,
    Divider,
    Typography,
    Fade,
    Box,
    Modal,
    List, ListItemButton, ListItemIcon, ListItemText, ListItemAvatar,
    Avatar
} from '@mui/material';
import HashPackConnectModal from "../components/HashPackConnectModal";
import AboutDlg from '../components/MainMenu/AboutDlg';
import LeaderBoardDlg from "../components/LeaderBoardDlg";
import SettingDlg from "../components/SettingDlg";
import StatDlg from "../components/StatDlg";
import BackgroundImage from "../assets/img/board.png";
import { useHashConnect } from "../api/HashConnectAPIProvider.tsx";
import { getRequest, postRequest } from "../api/apiRequests";

import * as env from "../env";
const socket = socketIO.connect(env.SERVER_URL);

function Home() {
    const [netType, setNetType] = useState("");
    const [open, setOpen] = React.useState(false);
    const [inputAccountId, setInputAccountId] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [walletConnectModalViewFlag, setWalletConnectModalViewFlag] = useState(false);
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

    const { walletData, installedExtensions, connect, disconnect, sendHbarToTreasury } = useHashConnect(netType);
    const [walletId, setWalletId] = useState(null)

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
        if (walletData.pairingData != null) {
            if (walletData.pairingData.length != 0) {
                if (walletData.pairingData.length == undefined) {
                    setWalletId(walletData.pairingData.accountIds[0])
                }
                else {
                    setWalletId(walletData.pairingData[0].accountIds[0])
                }
            }
        }
        else
            setWalletId(null)
    }, [walletData]);

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
        console.log(">>>>>",_res);
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
            mnu = "https://mainnet-public.mirrornode.hedera.com";
        else
            mnu = "https://testnet.mirrornode.hedera.com";
        let g_hbarBalanceInfo = await getRequest(mnu + "/api/v1/balances?account.id=" + walletId);
        if (!g_hbarBalanceInfo || g_hbarBalanceInfo.balances?.length === 0) {
            g_hbarBalance = 0;
        }
        else {
            g_hbarBalance = g_hbarBalanceInfo.balances[0].balance;
        }
        if (Math.floor(parseInt(changeToRealValue(g_hbarBalance, 8), 10)) - 1 < 0)
            setTotalHbarAmount(0);
        else
            setTotalHbarAmount(Math.floor(parseInt(changeToRealValue(g_hbarBalance, 8), 10)) - 1);
        setLoadingView(false);
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const createEvent = () => {
        document.getElementById("walletId").click();
        document.getElementById("money").click();
    }

    const onConnectHashpackWallet = () => {
        setWalletConnectModalViewFlag(true);
        setOpen(false);
        document.getElementById("treasury").click();
    }

    const onClickWalletConnectModalClose = () => {
        setWalletConnectModalViewFlag(false);
    }

    const onClickConnectHashPack = () => {
        if (installedExtensions) {
            connect();
            setWalletConnectModalViewFlag(false);
        } else {
            alert(
                "Please install HashPack wallet extension first. from chrome web store."
            );
        }
    };

    const onGoToLeaderBoard = async () => {
        setLeaderBoardDlgViewFlag(true);
    }

    const onClickCopyPairingStr = () => {
        navigator.clipboard.writeText(walletData.pairingString);
    };

    const onClickDisconnectHashPack = () => {
        disconnect();
        setInputAccountId('');
        setWalletId ('')
        setTimeout(createEvent, 1000);
        setTreasuryInfo(false);
        setWalletConnectModalViewFlag(false);
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

                        const _approveResult = await sendHbarToTreasury(hbarAmount_);

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
            <button id="connectWallet" onClick={() => { onConnectHashpackWallet(); }} />
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
            <div>
                <Modal
                    open={walletConnectModalViewFlag}
                    onClose={() => onClickWalletConnectModalClose()}
                    centered="true"
                    className="hashpack-connect-modal"
                >
                    <HashPackConnectModal
                        pairingString={walletData.pairingString}
                        connectedAccount={walletId}
                        onClickConnectHashPack={onClickConnectHashPack}
                        onClickCopyPairingStr={onClickCopyPairingStr}
                        onClickDisconnectHashPack={onClickDisconnectHashPack}
                    />
                </Modal>
            </div>
        </div>
    )
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const dialogStyle = css`
    .MuiPaper-root {
        background: transparent;
        overflow-y: visible;
    }
`

export default Home;