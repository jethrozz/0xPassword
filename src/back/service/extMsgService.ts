import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { network, SELECTED_ACCOUNT_KEY } from '../../common/const';
import { getSessionStorage, getLocalStorage } from './storageService';
import { AccountInfo} from '../0xPasswordUtil';
import { ServiceWorker } from './workerService';
// 用于和外部插件通信

export class ExtMsgService {
    extChannel: chrome.runtime.Port | null = null;
    serviceWorker: ServiceWorker | null = null;
    connected: boolean = false;
    extension_id: string | null = null;

    constructor(ext_id: string, serviceWorker: ServiceWorker | null){
        this.extension_id = ext_id;
        this.serviceWorker = serviceWorker;
        this.connect();
    }

    connect():void{
        if(this.extension_id){
            if(!this.connected){
                this.extChannel = chrome.runtime.connect(this.extension_id, { name: 'other_ext<->sui_ui' });
                this.extChannel.onMessage.addListener(this.onExtMessage);
                this.connected = true;
            }
            this.extChannel?.onDisconnect.addListener(message => {
                console.log("ext channel 断开连接", message);
                this.connected = false;
                this.extChannel = null;
              });
        }
    }

    onExtMessage = (message: any) => {
        console.log("收到消息", message);
        if (message.payload.method == "signTransactionDataResponse") {
          this.onSignTransactionDataResponse(message.id, message.payload.args.signature)
        } else if (message.payload.method == "storedEntitiesResponse") {
          let accounts = message.payload.args.entities;
          for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].selected) {
              let acc = accounts[i];
              handleAccountChange(acc);
            }
          }
        } else if (message.payload.method == "signDataResponse") {
          this.onSignDataResponse(message.id, message.payload.args.signature)
        }
    };

    onSignTransactionDataResponse = async (msgId: string, signature: string) => {
        const rpcUrl = getFullnodeUrl(network);
        const client = new SuiClient({ url: rpcUrl });
        let saveKey = 'tx' + msgId;
        let txData = await getSessionStorage(saveKey);
        let txResult = await client.executeTransactionBlock({
          transactionBlock: txData,
          signature: signature,
        });
        console.log("txResult", txResult);
        if (this.serviceWorker){
            this.serviceWorker.postSavePasswordResponse(msgId, txResult.digest);
        }
    };
    postGetStoredEntities = () => {
        let getStoredEntities = {
            "id": "a65d8fa0-1cda-4273-b137-a0c2af7a9c45",
            "payload": {
                "method": "getStoredEntities",
                "type": "method-payload",
                "args": {
                    "type": "accounts"
                }
            }
        }
        this.extChannel?.postMessage(getStoredEntities);
    };

    postSign = async (mk: string) => {
        let account = await getLocalStorage("SELECTED_ACCOUNT") as AccountInfo;
        if(!account){
            throw new Error("当前未选择有效账户");
        }

        let sign = {
            "id": "a65d8fa0-1cda-4273-b137-a0c2af7a9c45",
            "payload": {
                "method": "signData",
                "type": "method-payload",
                "args": {
                    "data": mk,
                    "id": account.id
                }
            }
        }
        this.extChannel?.postMessage(sign);
    }

    onSignDataResponse = (msgId: string, signature: string) => {
        console.log("收到消息", msgId, signature);
        this.serviceWorker?.setMk(signature);
    }
}



function handleAccountChange(newAccount: AccountInfo) {
    // 使用chrome.storage替代localStorage { [EXTENSION_ID_KEY]: message.data.id }
    chrome.storage.local.set({ [SELECTED_ACCOUNT_KEY]: newAccount });
}