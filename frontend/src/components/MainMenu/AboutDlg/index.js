import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';
import { toast } from "react-toastify";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { TextField } from '@mui/material';

import BackgroundImage from "../../../assets/img/board.png";

const MAIN_COLOR = '#ffc000';
const BUTTON_COLOR = '#9c27b0';
const TITLE_COLOR = '#ffff00';

const MAIN_BUTTON_STYLE = {
    width: '100px',
    height: '40px',
    borderRadius: '5px',
    textTransform: 'none',
    fontSize: 18,
    fontWeight: 700,
    color: '#9c27b0',
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

function AboutDlg({
    totalHbarAmount,
    type,
    onDeposit,
    onCancel
}) {
    // const [hbarAmount, setHbarAmount] = useState(totalHbarAmount);
    // const [hbarValueText, setHbarValueText] = useState();

    // const handleSliderChange = (e) => {
    //     setHbarAmount(e.target.value);
    // }

    const [value, setValue] = useState(totalHbarAmount);

    const onClickDepositBtn = () => {
        if (value < 1 || value > totalHbarAmount){
            toast.error ("Please enter a number from 1 to " + totalHbarAmount + ".");
            return;
        }
        onDeposit (value);
    }
    return (
        <div
            style={{
                backgroundImage: 'url(' + BackgroundImage + ')',
                backgroundSize: 'cover',
                width: '400px',
                height: '300px',
                padding: '0px'
            }}>
             
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <h1 style={{
                    fontWeight: '700',
                    margin: '0 0 10px 0',
                    color: `${TITLE_COLOR}`
                }}>Setting</h1>
                <p style={{
                    fontWeight: '700',
                    color: '#ffff00',
                    fontSize: 16
                }}>Please choose an amount to deposit.</p>
                <Box sx={{ width: 250, marginTop: '20px'}}>
                    {/* <Typography id="non-linear-slider" gutterBottom  color="#1976d2" sx={{fontWeight: 800 }}>
                        {value} ℏ
                    </Typography>
                    <Slider
                        value={value}
                        min={1}
                        step={1}
                        max={totalHbarAmount}
                        onChange={handleChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="non-linear-slider"
                    /> */}
                    <div className=''>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Amount To Deposit(ℏ):</label>
                        <input 
                            type="number"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder={"Please enter a number from 1 to " + totalHbarAmount}
                            onChange={(event) => setValue(event.target.value)}
                            value={value}
                        />
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{"Please enter a number from 1 to " + totalHbarAmount}</label>
                    </div>
                </Box>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '15px'
                }}>
                    {
                        type === 'deposit' &&
                        <Button
                            onClick={onClickDepositBtn}
                            sx={MAIN_BUTTON_STYLE}
                            disabled={totalHbarAmount == 0}
                            variant="outlined"
                            color="error"
                        >
                            Deposit
                        </Button>
                    }
                    <Button onClick={() => { onCancel() }}
                        sx={MAIN_BUTTON_STYLE} style={{marginRight: 0}} variant="outlined" color="error">
                        Cancel
                    </Button>
                </div>
            </div>
        </div >
    );
}

export default AboutDlg;