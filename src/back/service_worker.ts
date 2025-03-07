import { onUIMsgReceive } from './service/uiMsgService';
import { ServiceWorker } from './service/workerService';

let serviceWorker : ServiceWorker;

async function initConnection() {
  try {
    console.log('service_worker.js');
    serviceWorker = new ServiceWorker();
    serviceWorker.init();
    // 监听来自UI的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse ) => {
        onUIMsgReceive(message, sender, sendResponse, serviceWorker);
    });

    chrome.runtime.onConnect.addListener(function (port) {
        //监听内部扩展的链接
        serviceWorker.onInnerConnectedMsg(port);
    });
  } catch (error) {
    console.error("连接初始化失败:", error);
    // 这里可以添加重试逻辑
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