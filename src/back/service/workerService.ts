import { getLocalStorage } from '../service/storageService';
import { EXTENSION_ID_KEY, SELECTED_ACCOUNT_KEY, MK_KEY, TEMP_MK } from '../../common/const';
import { ExtMsgService } from '../service/extMsgService';
import { InnerMsgService } from '../service/innerMsgService';
import { PasswordObject, callAddPassword, getPasswordObjects } from '../0xPasswordUtil';



export class ServiceWorker {
    mk: string | null = null;
    passwordList: Array<PasswordObject> | null = [];
    EXTENSION_ID: string | null = null;
    extChannel: chrome.runtime.Port | null = null;
    innerChannel: chrome.runtime.Port | null = null;
    extMsgService: ExtMsgService | null = null;
    innerMsgService: InnerMsgService | null = null;
    
    constructor() {
        this.loadLocalConfig(); //从本地storage中获取配置
    }

    async init() {
        if (!this.EXTENSION_ID) {
            this.EXTENSION_ID = await getLocalStorage(EXTENSION_ID_KEY);
        }
        if (this.EXTENSION_ID) {
            //建立连接
            console.log("获取到扩展ID:", this.EXTENSION_ID);
            this.extMsgService = new ExtMsgService(this.EXTENSION_ID, this);
        }
    }

    onInnerConnectedMsg = (port: chrome.runtime.Port) => {
        console.log("收到inner连接", port);
        this.innerMsgService = new InnerMsgService(port, this);
    }

    savePassword = async (password: string, url: string, username: string) => {
        if(!this.mk){
            this.mk = await getLocalStorage(MK_KEY);
        }

        if (this.mk) {
            const account = await getLocalStorage(SELECTED_ACCOUNT_KEY);
            callAddPassword(this.extChannel, password, url, username, this.mk, account.address);
        } else {
            console.log("MK not set")
        }
    }

    postGetStoredEntities = () => {
        this.extMsgService?.postGetStoredEntities();
    }

    getPasswordObjectsToInner = async (pageOrigin: string) => {
        const account = await getLocalStorage(SELECTED_ACCOUNT_KEY);
        if (!this.mk) {
            this.mk = await getLocalStorage(MK_KEY);
        }
        if (account) {
            let passwordList = await this.getPasswordObjectsByPageOrigin(pageOrigin) as Array<PasswordObject>;
            this.innerChannel?.postMessage({ method: "getPasswordObjectDataRes", code: 0, args: passwordList });
        } else {
            this.postGetStoredEntities();
        }
    }

    updateConfig = (ext_id: string, mk: string) => {
        chrome.storage.local.set({ [EXTENSION_ID_KEY]: ext_id });
        //chrome.storage.local.set({ [MK_KEY]: message.data.key });
        chrome.storage.local.set({[TEMP_MK]: mk});
        //调用钱包进行签名，签名才是真正的mk
        this.signTempMk(mk);
    }

    loadLocalConfig = async () => {
        //从本地storage中获取配置
        //修改为同步调用
        const result = await chrome.storage.local.get([EXTENSION_ID_KEY, MK_KEY]);
        if (result[EXTENSION_ID_KEY]) {
            this.EXTENSION_ID = result[EXTENSION_ID_KEY];
        }
        if (result[MK_KEY]) {
            this.mk = result[MK_KEY];
        }
    }

    getPasswordObjectsByPageOrigin = async (pageOrigin: string) => {
        const account = await getLocalStorage(SELECTED_ACCOUNT_KEY);
        if (account) {
            let passwordList = await getPasswordObjects(account.address, this.mk!) as Array<PasswordObject>;
            return passwordList.filter(password => password.website?.includes(pageOrigin));
        }
    }
    signTempMk = (mk: string) =>{
        this.extMsgService?.postSign(mk);
    }
    setMk = (mk: string) => {
        this.mk = mk;
        chrome.storage.session.set({ [MK_KEY]: mk});
    }

    postSavePasswordResponse = (msgId: string, digest: string) => {
        this.innerChannel?.postMessage({ id: msgId, method: "save_password_response", code: 0, args: digest })
    }
}