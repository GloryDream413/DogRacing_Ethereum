import React, { useState, useEffect } from "react";
import { PieChart } from "react-minimal-pie-chart";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CircularProgress, Backdrop, Button } from "@mui/material";

import { getRequest, postRequest } from "../../api/apiRequests";
import * as env from "../../env";
import BackgroundImage from "../../assets/img/board.png";

const BUTTON_COLOR = "#fb497e";

const MAIN_BUTTON_STYLE = {
  width: "100px",
  height: "36px",
  borderRadius: "5px",
  textTransform: "none",
  fontSize: 18,
  fontWeight: 700,
  color: "#fb497e",
  padding: "0 25px",
  // backgroundColor: `${BUTTON_COLOR}`,
  margin: "5px 0",
  "&:hover": {
    backgroundColor: `${BUTTON_COLOR}`,
    boxShadow: "none",
    color: "white",
  },
  "&:focus": {
    outline: "none",
    boxShadow: "none",
  },
};

function LeaderBoardDlg({ onOK }) {
  const [loadingView, setLoadingView] = useState(false);
  const [topHplayers, setTopHplayers] = useState(null);
  const [randomDelta, setRandomDelta] = useState(0.02);

  useEffect(() => {
    getLeaderBoardData();
    let randDel = Math.random() * 0.1;
    setRandomDelta(randDel);
  }, []);

  const getLeaderBoardData = async () => {
    setLoadingView(true);
    const _res = await getRequest(
      env.SERVER_URL + "/api/control/get_leaderboard_info"
    );
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
    setTopHplayers(_res.data);
    setLoadingView(false);
  };

  return (
    <div
      className="self-center"
      style={{
        backgroundImage: "url(" + BackgroundImage + ")",
        backgroundSize: "80vw 80vh",
        width: "80vw",
        height: "80vh",
      }}
    >
      <div className="text_black w-full flex flex-col items-center justify-center" style={{height: '100%'}}>
        <div className="text-4xl" style={{ height: "18%", display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
            <span></span>
          <span className="bold text-[#ffff00]">Top 10 players</span>
          <span></span>
        </div>
        <div
          className="overflow-x-auto text_black block sm:flex justify-center  md:w-full w-[100vw]"
          style={{
            height: "57%",
            overflowY: "auto",
            alignItems: "start",
            width: "600px",
          }}
        >
          <table className="table-auto border-spacing-x-5 border-spacing-y-2  ">
            <thead>
              <tr className=" ">
                <th className="text-center p-3 md:p-3">No</th>
                <th className="text-center p-3 md:p-3">Player</th>
                <th className="text-center p-3 md:p-3">Earning</th>
              </tr>
            </thead>
            <tbody>
              {topHplayers &&
                topHplayers.length > 0 &&
                topHplayers.map(
                  (item, index) =>
                    item._id !== "" && (
                      <tr className=" " key={index}>
                        <td className="text-center  p-1 md:p-3">{index + 1}</td>
                        <td className="text-center  p-1 md:p-3">
                          {item.accountId}
                        </td>
                        {/* <td className="text-center  p-1 md:p-3">Hedera</td> */}
                        <td className="text-center  p-1 md:p-3">
                          {Number(item.earningAmount).toFixed(3)} ℏ
                        </td>
                      </tr>
                    )
                )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            // position: 'absolute',
            bottom: "6vh",
            height: "25%",
          }}
        >
          <Button
            onClick={() => {
              onOK();
            }}
            sx={MAIN_BUTTON_STYLE}
            variant="outlined"
            color="error"
          >
            OK
          </Button>
        </div>
      </div>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingView}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <ToastContainer autoClose={5000} draggableDirection="x" />
    </div>
  );
}

export default LeaderBoardDlg;
