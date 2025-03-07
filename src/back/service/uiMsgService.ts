//监听UI发过来的消息
import { SELECTED_ACCOUNT_KEY } from '../../common/const';
import { getLocalStorage } from './storageService';
import { ServiceWorker } from './workerService';

export const onUIMsgReceive = (message: any, _sender: any, sendResponse: any, workerService: ServiceWorker) => {
    if (message.type === 'CONFIG_UPDATE') {
        workerService?.updateConfig(message.data.id, message.data.key);
        return true; // 保持消息通道开放用于sendResponse
    } else if (message.type === 'GET_SELECTED_ACCOUNT') {
        (async () => {
            const account = await getLocalStorage(SELECTED_ACCOUNT_KEY);
            console.log("GET_SELECTED_ACCOUNT rec", account);
            if (account) {
                sendResponse({ type: "GET_SELECTED_ACCOUNT_RESPONSE", data: account, code: 0 });
            } else {
                sendResponse({ type: "GET_SELECTED_ACCOUNT_RESPONSE", data: {}, code: -1 });
                workerService.postGetStoredEntities();
            }
        })();
        return true;    
    }
    return false;
}