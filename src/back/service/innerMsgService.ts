import { ServiceWorker } from './workerService';

//用于内部发送和接收消息

export class InnerMsgService{
    innerChannel: chrome.runtime.Port | null = null;
    serviceWorker: ServiceWorker | null = null;

    constructor(innerChannel: chrome.runtime.Port, serviceWorker: ServiceWorker){
        this.serviceWorker = serviceWorker;
        this.innerChannel = innerChannel;
        this.innerChannel.onMessage.addListener(this.onInnerMessage);
        this.innerChannel.onDisconnect.addListener(message => {
            console.log("inner channel 断开连接", message);
        });
    }

    onInnerMessage = async (message: any) => {
        if ("save_password" == message.method) {
            this.serviceWorker?.savePassword(message.args.password, message.args.url, message.args.username);
            return true;
        } else if ("getPasswordObjectData" === message.method) {
          (async () => {
            this.serviceWorker?.getPasswordObjectsToInner(message.args.pageOrigin);
          })();
          return true;
        }
    }

    postSavePasswordResponse = (msgId: string, digest: string) => {
        this.innerChannel?.postMessage({ id: msgId, method: "save_password_response", code: 0, args: digest })
    }


}