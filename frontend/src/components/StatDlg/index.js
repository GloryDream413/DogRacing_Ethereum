import React, { useState, useEffect } from 'react';
// import "../../assets/css/styles/index.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    CircularProgress,
    Backdrop,
    Button,
} from '@mui/material';

import { getRequest } from "../../api/apiRequests";
import * as env from "../../env";
import CustomPieChart from './chartWidget';
import BackgroundImage from "../../assets/img/board.png";

const MAIN_COLOR = '#ffc0ff';
const BUTTON_COLOR = '#fb497e';
const TITLE_COLOR = '#8b1832';

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

function StatDlg({
    onOK
}) {
    const [loadingView, setLoadingView] = useState(false);

    return (
        <div className="self-center"
            style={{
                backgroundImage: 'url(' + BackgroundImage + ')',
                backgroundSize: '50vw 80vh',
                width: '50vw',
                height: '80vh',
                margin: 'auto'
            }}
        >
            <div className="text_black w-full flex flex-col items-center justify-center" style={{ height: '100%' }}>
                <div className="flex flex-col" style={{ height: '75%' }}>
                    <div className="text-4xl" style={{ height: "30%", display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                        <span></span>
                        <span className="bold text-[#8b1832] w-full text-light text-center">Winning</span>
                        <span></span>
                    </div>
                    <CustomPieChart style={{height: '70%'}}/>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bottom: "6vh",
                    height: "25%",
                }}>
                    <Button onClick={() => { onOK() }}
                        sx={MAIN_BUTTON_STYLE}
                        variant="outlined"
                        color="error"
                    >
                        OK
                    </Button>
                </div>
            </div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loadingView}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <ToastContainer autoClose={5000} draggableDirection="x" />
        </div>
    );
}

export default StatDlg;
