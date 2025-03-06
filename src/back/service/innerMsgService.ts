//用于内部发送和接收消息

export class InnerMsgService{
    innerChannel: chrome.runtime.Port | null = null;

    constructor(innerChannel: chrome.runtime.Port){
        this.innerChannel = innerChannel;
        this.innerChannel.onMessage.addListener(this.onInnerMessage);
        this.innerChannel.onDisconnect.addListener(message => {
            console.log("inner channel 断开连接", message);
        });
    }

    onInnerMessage = async (message: any) => {
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
}

export function postSavePasswordResponse(digest: string){

}