import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { network, SELECTED_ACCOUNT_KEY } from '../../common/const';
import { getSessionStorage } from './storageService';
import { AccountInfo} from '../0xPasswordUtil';
// 用于和外部插件通信

export class ExtMsgService {
    extChannel: chrome.runtime.Port | null = null;
    innerChannel: chrome.runtime.Port | null = null;
    connected: boolean = false;
    extension_id: string | null = null;

    constructor(ext_id:string, innerChannel : chrome.runtime.Port){
        this.extension_id = ext_id;
        this.innerChannel = innerChannel;
    }

    connect():void{
        if(this.extension_id){
            this.extChannel = chrome.runtime.connect(this.extension_id, { name: 'other_ext<->sui_ui' });
            this.extChannel.onMessage.addListener(this.onExtMessage);
            this.extChannel.onDisconnect.addListener(message => {
                console.log("ext channel 断开连接", message);
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
        }
    }

    onSignTransactionDataResponse = async (msgId: string, signature: string) => {
        const rpcUrl = getFullnodeUrl(network);
        const client = new SuiClient({ url: rpcUrl });
        let saveKey = 'tx' + msgId;
        let txData = await getSessionStorage(saveKey);
        let txResult = await client.executeTransactionBlock({
          transactionBlock: txData,
          signature: signature,
        });
        if(this.innerChannel){
            this.innerChannel?.postMessage({ id: msgId, method: "save_password_response", code: 0, args: txResult.digest })   
        }
        console.log("txResult", txResult);
    }


}

function handleAccountChange(newAccount: AccountInfo) {
    // 使用chrome.storage替代localStorage { [EXTENSION_ID_KEY]: message.data.id }
    chrome.storage.local.set({ [SELECTED_ACCOUNT_KEY]: newAccount });
}