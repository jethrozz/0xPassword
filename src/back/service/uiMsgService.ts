//监听UI发过来的消息
import { EXTENSION_ID_KEY, SELECTED_ACCOUNT_KEY, MK_KEY, TEMP_MK } from '../../common/const';
import { getLocalStorage } from './storageService';

const onUIMsgReceive = (message, _sender, sendResponse) => {
    if (message.type === 'CONFIG_UPDATE') {
      // 存储到chrome.storage
      // 不能明文存，
      //加密密钥为了安全性，先调用钱包签名，做完签名之后的密钥才是真的加密密钥。不能明文存储，使用aes+加密密钥进行加密
  
      chrome.storage.local.set({ [EXTENSION_ID_KEY]: message.data.id });
      chrome.storage.local.set({ [MK_KEY]: message.data.key });
      chrome.storage.session.set({[TEMP_MK]: message.data.key});
  
  
      mk = message.data.key;
      EXTENSION_ID = message.data.id;
      return true; // 保持消息通道开放用于sendResponse
    } else if(message.type === 'GET_SELECTED_ACCOUNT'){
      (async () => {
        const account = await getLocalStorage(SELECTED_ACCOUNT_KEY);
        console.log("GET_SELECTED_ACCOUNT rec", account);
        if(account){
          sendResponse({type:"GET_SELECTED_ACCOUNT_RESPONSE", data: account, code:0});
        }else{
          sendResponse({type:"GET_SELECTED_ACCOUNT_RESPONSE", data: {}, code:-1});
          if(extChannel){
            extChannel.postMessage(getStoredEntities);
          }
        }
      })();
      return true;
    }
    return false;
  }