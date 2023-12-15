import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import React, { useEffect, useState } from "react";
import {
  AccountId,
  TokenId,
  NftId,
  Hbar,
  TransferTransaction,
  AccountAllowanceApproveTransaction,
  TokenAssociateTransaction,
  AccountAllowanceDeleteTransaction,
  PrivateKey,
  PublicKey,
} from '@hashgraph/sdk';
import * as env from "../env.js";

import { getRequest, postRequest } from "./apiRequests.js";


//Type declarations
interface SaveData {
  topic: string;
  pairingString: string;
  privateKey: string;
  pairedWalletData: HashConnectTypes.WalletMetadata | null;
  pairedAccounts: string[];
  netWork?: string;
  id?: string;
  accountIds?: string[];
}

type Networks = "testnet" | "mainnet" | "previewnet";


interface PropsType {
  children: React.ReactNode;
  hashConnect: HashConnect;
  netWork: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  debug?: boolean;
}

export interface HashConnectProviderAPI {
  connect: () => void;
  disconnect: () => void;
  tokenTransfer: () => void;
  walletData: SaveData;
  netWork: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata | null;
}

// const availableExtensions: HashConnectTypes.WalletMetadata[] = [];

const INITIAL_SAVE_DATA: SaveData = {
  topic: "",
  pairingString: "",
  privateKey: "",
  pairedAccounts: [],
  pairedWalletData: null,
};

let APP_CONFIG: HashConnectTypes.AppMetadata = {
  name: "DogRacing",
  description: "DogRacing",
  icon: "favicon.ico",
};

const loadLocalData = (): null | SaveData => {
  let foundData = localStorage.getItem("hashconnectData");
  if (foundData) {
    const saveData: SaveData = JSON.parse(foundData);
    return saveData;
  } else return null;
};

export const HashConnectAPIContext =
  React.createContext<HashConnectProviderAPI>({
    connect: () => null,
    disconnect: () => null,
    tokenTransfer: () => null,
    walletData: INITIAL_SAVE_DATA,
    netWork: localStorage.getItem("NETTYPE")?.trim(),
    installedExtensions: null,
  });

export default function HashConnectProvider({
  children,
  hashConnect,
  metaData,
  netWork,
  debug,
}) {
  //Saving Wallet Details in Ustate
  const [saveData, SetSaveData] = useState(INITIAL_SAVE_DATA);
  const [installedExtensions, setInstalledExtensions] = useState(null);

  //? Initialize the package in mount
  const initializeHashConnect = async () => {
    // console.log("initializeHashConnect");

    const saveData = INITIAL_SAVE_DATA;
    const localData = loadLocalData();
    try {
      if (debug) console.log("===Local data not found.=====");

      //first init and store the private for later
      let initData = await hashConnect.init(APP_CONFIG);
      console.log(initData);
      saveData.privateKey = initData.privKey;
      // console.log("initData privkey", saveData.privateKey);

      //then connect, storing the new topic for later
      const state = await hashConnect.connect();
      saveData.topic = state.topic;

      //generate a pairing string, which you can display and generate a QR code from
      console.log(">>>>>>>>>>>>>>>>", netWork)
      saveData.pairingString = hashConnect.generatePairingString(state, netWork, false);

      //find any supported local wallets
      hashConnect.findLocalWallets();
    } catch (error) {
      // console.log(error);
    } finally {console.log (localData, "BBBBBBBBBBBBBBB")
      if (localData) {
        SetSaveData((prevData) => ({ ...prevData, ...localData }));
      } else {
        SetSaveData((prevData) => ({ ...prevData, ...saveData }));
      }
    }
  };

  const saveDataInLocalStorage = async (data) => {
    SetSaveData((prevData) => ({ ...prevData, ...data }));
  };

  // const additionalAccountResponseEventHandler = (
  //   data: MessageTypes.AdditionalAccountResponse
  // ) => {
  //   // if (debug) console.debug("=====additionalAccountResponseEvent======", data);
  //   // Do a thing
  // };

  const foundExtensionEventHandler = (
    data
  ) => {
    if (debug) console.debug("====foundExtensionEvent====", data);
    // Do a thing
    setInstalledExtensions(data);
  };

  const pairingEventHandler = (data) => {
    // Save Data to localStorage
    saveDataInLocalStorage(data);
  };

  useEffect(() => {
    initializeAll();
  }, []);

  const initializeAll = () => {
    //Intialize the setup
    initializeHashConnect();

    // Attach event handlers
    // hashConnect.additionalAccountResponseEvent.on(
    //   additionalAccountResponseEventHandler
    // );
    hashConnect.foundExtensionEvent.on(foundExtensionEventHandler);
    hashConnect.pairingEvent.on(pairingEventHandler);

    return () => {
      // Detach existing handlers
      // hashConnect.additionalAccountResponseEvent.off(
      //   additionalAccountResponseEventHandler
      // );
      hashConnect.foundExtensionEvent.off(foundExtensionEventHandler);
      hashConnect.pairingEvent.off(pairingEventHandler);
    };
  };

  const connect = () => {
    if (installedExtensions) {
      hashConnect.connectToLocalWallet(saveData.pairingString);
    } else {
      // if (debug) console.log("====No Extension is not in browser====");
      return "wallet not installed";
    }
  };

  const disconnect = async () => {
    if (saveData.pairingData.length == undefined) {
      hashConnect.disconnect(saveData.pairingData.topic)
    }
    else {
      hashConnect.disconnect(saveData.pairingData[0].topic)
    }

    await SetSaveData(INITIAL_SAVE_DATA);
    // await SetInfo([]);
    let foundData = localStorage.getItem("hashconnectData");
    if (foundData)
      localStorage.removeItem("hashconnectData");

    initializeAll();
  };

  const sendHbarToTreasury = async (amount_) => {
    let _accountId
    let _provider
    if (saveData.pairingData.length == undefined) {
      _accountId = saveData.pairingData.accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData.topic, _accountId);
    }
    else {
      _accountId = saveData.pairingData[0].accountIds[0];
      _provider = hashConnect.getProvider(netWork, saveData.pairingData[0].topic, _accountId);
    }

    const _signer = hashConnect.getSigner(_provider);
    var tid = localStorage.getItem("TREASURY_ID")?.trim();
    if (tid == undefined) return false;
    const _treasuryId = AccountId.fromString(tid);

    const _hbar = new Hbar(amount_);

    const allowanceTx = new AccountAllowanceApproveTransaction().approveHbarAllowance(_accountId, _treasuryId, _hbar);
    if (!allowanceTx) return false;
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(allowanceSubmit.transactionId);

    if (allowanceRx.status._code === 22)
      return true;

    return false;
  }

  return (
    <HashConnectAPIContext.Provider
      value={{ walletData: saveData, installedExtensions, connect, disconnect, sendHbarToTreasury }}>
      {children}
    </HashConnectAPIContext.Provider>
  );
}

const defaultProps: Partial<PropsType> = {
  metaData: {
    name: "DogRacing",
    description: "DogRacing",
    icon: "favicon.ico",
  },
  netWork: localStorage.getItem("NETTYPE")?.trim(),
  debug: false,
};

HashConnectProvider.defaultProps = defaultProps;

export function useHashConnect() {
  const value = React.useContext(HashConnectAPIContext);
  return value;
}