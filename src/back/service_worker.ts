import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getLocalStorage, getSessionStorage } from './service/storageService';
import { network, EXTENSION_ID_KEY, SELECTED_ACCOUNT_KEY, MK_KEY, TEMP_MK } from '../common/const';
import { onUIMsgReceive } from './service/uiMsgService';
import {ExtMsgService} from './service/extMsgService';
import {InnerMsgService} from './service/innerMsgService';
import { AccountInfo, PasswordObject, callAddPassword, getPasswordObjects } from './0xPasswordUtil';



// 配置存储key

//定义一个map
let innerChannel: chrome.runtime.Port | null = null;
let extChannel: chrome.runtime.Port | null = null;
let EXTENSION_ID: string | null = null;
let mk: string | null = null;
let passwordList: Array<PasswordObject> | null = [];

class ServiceWorker {
  mk : string | null = null;
  passwordList: Array<PasswordObject> | null = [];
  EXTENSION_ID: string | null = null;
  extChannel: chrome.runtime.Port | null = null;
  innerChannel: chrome.runtime.Port | null = null;
  extMsgService: ExtMsgService | null = null;
  innerMsgService: InnerMsgService | null = null;
  constructor(){
  }

  async init() {
    this.EXTENSION_ID = await getLocalStorage(EXTENSION_ID_KEY);
    if(this.EXTENSION_ID){
      //建立连接
      console.log("获取到扩展ID:", this.EXTENSION_ID);
      this.extMsgService = new ExtMsgService(this.EXTENSION_ID, this.innerChannel);
    }
  }

  onInnerConnectedMsg = (port: chrome.runtime.Port) => {
    this.innerMsgService = new InnerMsgService(port);
  }
}

let serviceWorker : ServiceWorker;


const getStoredEntities = {
  "id": "a65d8fa0-1cda-4273-b137-a0c2af7a9c45",
  "payload": {
    "method": "getStoredEntities",
    "type": "method-payload",
    "args": {
      "type": "accounts"
    }
  }
}

async function initConnection() {
  try {
    serviceWorker = new ServiceWorker();
    serviceWorker.init();
  // 监听来自UI的消息
  chrome.runtime.onMessage.addListener(onUIMsgReceive);

  chrome.runtime.onConnect.addListener(function (port) {
    console.log("收到连接", port);
    innerChannel = port;
    port.onMessage.addListener(onInnerMessage);
  });
  console.log('service_worker.js');
    
    // 连接建立后操作
    extChannel.postMessage(getStoredEntities);
    extChannel.onMessage.addListener(onExtMessage);


  } catch (error) {
    console.error("连接初始化失败:", error);
    // 这里可以添加重试逻辑
  }
}

function handleAccountChange(newAccount: AccountInfo) {
  // 使用chrome.storage替代localStorage { [EXTENSION_ID_KEY]: message.data.id }
  chrome.storage.local.set({ [SELECTED_ACCOUNT_KEY]: newAccount });
}

const onExtMessage = async (message: any) => {
  console.log("收到消息", message);
  if (message.payload.method == "signTransactionDataResponse") {
    console.log("签名响应", message);
    const rpcUrl = getFullnodeUrl(network);
    const client = new SuiClient({ url: rpcUrl });
    let saveKey = 'tx' + message.id;
    let txData = await getSessionStorage(saveKey);
    console.log("txdata", txData);
    //let txBytes = fromBase64(txData);
    let txResult = await client.executeTransactionBlock({
      transactionBlock: txData,
      signature: message.payload.args.signature,
    });
    innerChannel?.postMessage({ id: message.id, method: "save_password_response", code: 0, args: txResult.digest })
    console.log("txResult", txResult);
  } else if (message.payload.method == "storedEntitiesResponse") {
    let accounts = message.payload.args.entities;
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].selected) {
        let acc = accounts[i];
        handleAccountChange(acc);
      }
    }
  }
}

const onInnerMessage = async (message: any) => {
  console.log("onInnerMessage", message);
  if ("save_password" == message.method) {
    mk = await getStorage(MK_KEY);
    const account = await getStorage(SELECTED_ACCOUNT_KEY);
    if (mk) {
      let { password, url, username } = message.args;
      callAddPassword(extChannel, password, url, username, mk, account.address);
    } else {
      console.log("MK not set")
    }
  } else if ("getPasswordObjectData" === message.method) {
    (async () => {
      const account = await getStorage(SELECTED_ACCOUNT_KEY);
      let mainKey = await getStorage(MK_KEY);
      console.log("getPasswordObjectData account", account, mainKey);
      if (account) {
        passwordList = await getPasswordObjects(account.address, message.args.pageOrigin, mainKey) as Array<PasswordObject>;
        innerChannel?.postMessage({ method: "getPasswordObjectDataRes", code: 0, args: passwordList });
      } else {
        if (extChannel) {
          extChannel.postMessage(getStoredEntities);
        }
      }
    })();
    return true;
  }
}

try {


  // 在初始化时调用
  chrome.runtime.onStartup.addListener(initConnection);
  chrome.runtime.onInstalled.addListener(initConnection);
  // const signData = {
  //   "id": "d84bff23-ce1e-44b6-87be-36e27db9zxc1",
  //   "payload": {
  //       "type": "method-payload",
  //       "method": "signTransactionData",
  //       "args": {
  //           "data": "AAAAAAAAAQC/I1ivqXxUevd0/yb0aPcX6nrY+1FMtv8HmPbP5T2WNgdjb3VudGVyBmNyZWF0ZQAAkUWZkaPhd4M03EvQB8uQ/pmJpKq/zvTtGQlecSUH6kMBwyBjmXK21uTn6mvxj9D5OqVwlUP55+CWaZaLU+FXW/6UPykUAAAAACC1dj/+ztIaN/TWcg+3wT8VF+N6Lmv2EaVqgFXuF3nfOZFFmZGj4XeDNNxL0AfLkP6ZiaSqv8707RkJXnElB+pD6AMAAAAAAADwD0YAAAAAAAA=",
  //           "id": "db5e13a2-8ba9-4ec9-a7dc-7e1c05236dbc"
  //       }
  //   }
  // }
} catch (error) {
  console.error('worker js error:', error);
}