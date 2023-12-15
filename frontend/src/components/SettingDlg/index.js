import React, { useState } from 'react';

import {
    Button,
} from '@mui/material';

import BackgroundImage from "../../assets/img/board.png";

const BUTTON_COLOR = '#fb497e';

const MAIN_BUTTON_STYLE = {
    width: '100px',
    height: '36px',
    borderRadius: '5px',
    textTransform: 'none',
    fontSize: 18,
    fontWeight: 700,
    color: '#fb497e',
    padding: '0 25px',
    // backgroundColor: `${BUTTON_COLOR}`,
    margin: '5px 0',
    marginRight: '20px',
    '&:hover': {
        backgroundColor: `${BUTTON_COLOR}`,
        boxShadow: 'none',
        color: 'white'
    },
    '&:focus': {
        outline: 'none',
        boxShadow: 'none',
    }
};

function SettingDlg({
    nettype,
    onSet,
    onCancel
}) {
    const [treasuryID, setTreasuryID] = useState("");
    const [treasuryPVKey, setTreasuryPVKey] = useState("");
    const [treasuryFeeID, setTreasuryFeeID] = useState("");
    const [netType, setNetType] = useState(nettype);
    const [checked, setChecked] = useState(netType === "testnet" ? true : false)
    const [checkedValue, setCheckedValue] = useState(netType === "testnet" ? 'Testnet' : 'Mainnet')

    const onPrepare = () => {
        const info = {
            a: btoa(treasuryID),
            b: btoa(treasuryPVKey),
            c: btoa(treasuryFeeID),
            d: btoa(netType)
        };
        onSet(info);
    }

    return (
        <div className="self-center"
            style={{
                backgroundImage: 'url(' + BackgroundImage + ')',
                backgroundSize: '80vw 80vh',
                width: '80vw',
                height: '80vh',
                margin: 'auto'
            }}
        >
            <div className="text_black w-full flex flex-col items-center justify-center" style={{height: '100%'}}>
                <div className="text-4xl" style={{ height: "18%", display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                    <span></span>
                    <span className="bold text-[#ffff00]">Admin Setting</span>
                    <span></span>
                </div>
                <div className='overflow-x-auto text_black block sm:flex justify-center  md:w-full w-[100vw]'
                style={{
                    height: "57%",
                    overflowY: "auto",
                    alignItems: "start",
                    width: "300px",
                  }}
                >
                    <div className='py-4'>
                        <div className='py-2'>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Treasury Wallet ID:</label>
                            <input type="text" value={treasuryID} onChange={(e) => setTreasuryID(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Treasury Wallet ID" />
                        </div>
                        <div className='py-2'>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Treasury Wallet Private Key:</label>
                            <textarea id="treasuryKey" value={treasuryPVKey} onChange={(e) => setTreasuryPVKey(e.target.value)} rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Treasury Wallet Private Key"></textarea>
                        </div>
                        <div className='py-2'>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Loyalty Wallet ID:</label>
                            <input type="text" value={treasuryFeeID} onChange={(e) => setTreasuryFeeID(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Treasury Fee Wallet ID" />
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value={checkedValue}
                                className="sr-only peer"
                                checked={checked}
                                onClick={() => {
                                    if (netType === "testnet"){
                                        setNetType("mainnet");
                                        setChecked(false);
                                    }
                                    else {
                                        setNetType("testnet");
                                        setChecked(true);
                                    }
                                }}
                                onChange={(e) => setCheckedValue(e.target.value)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{netType}</span>
                        </label>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bottom: "6vh",
                    height: "25%",
                }}>
                    <Button onClick={() => { onPrepare() }}
                        sx={MAIN_BUTTON_STYLE}
                        disabled={ treasuryID === "" || treasuryPVKey === "" | treasuryFeeID === "" }
                        variant="outlined"
                        color="error"
                        >
                        Set
                    </Button>
                    <Button onClick={() => { onCancel() }}
                        sx={MAIN_BUTTON_STYLE}
                        variant="outlined"
                        color="error"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SettingDlg;
