import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { toBase64 } from '@mysten/sui/utils';
//import { fromBase64, toBase64 } from '@mysten/sui/utils';
const rpcUrl = getFullnodeUrl('testnet');
// create a client connected to devnet
const client = new SuiClient({ url: rpcUrl });
//定义一个map
const map = new Map();

const onMessage = (message: any) => {
  console.log("收到消息", message);
  if(message.payload.method == "signTransactionDataResponse") {
    console.log("签名响应", message);
    let txBytes = map.get(message.id);
    let txResult = client.executeTransactionBlock({
      transactionBlock: txBytes,
      signature: message.payload.args.signature,
    });
    console.log("txResult", txResult);
  }
}

try {
  
 

  console.log(client);
  console.log('service_worker.js');

    const getPermissionRequests = {
      "id": "a3106983-437f-435a-bdb7-7df69e8c8ff7",
      "payload": {
          "type": "get-permission-requests"
      }
    }

    const transactionRequests = {
      "id": "e3682dae-540b-485c-948b-af9c1859cfc5",
      "payload": {
          "type": "get-transaction-requests"
      }
    }

    const features = {
      "id": "9f1a5053-8c08-4016-a5ab-662b24892cf7",
      "payload": {
          "type": "get-features"
      }
    }

    const getNetwork = {
      "id": "89cd7e50-67c8-44ec-b371-21dd0825b61b",
      "payload": {
          "type": "get-network"
      }
    }

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

    const signData = {
      "id": "d84bff23-ce1e-44b6-87be-36e27db9zxc1",
      "payload": {
          "type": "method-payload",
          "method": "signTransactionData",
          "args": {
              "data": "AAAAAAAAAQC/I1ivqXxUevd0/yb0aPcX6nrY+1FMtv8HmPbP5T2WNgdjb3VudGVyBmNyZWF0ZQAAkUWZkaPhd4M03EvQB8uQ/pmJpKq/zvTtGQlecSUH6kMBwyBjmXK21uTn6mvxj9D5OqVwlUP55+CWaZaLU+FXW/6UPykUAAAAACC1dj/+ztIaN/TWcg+3wT8VF+N6Lmv2EaVqgFXuF3nfOZFFmZGj4XeDNNxL0AfLkP6ZiaSqv8707RkJXnElB+pD6AMAAAAAAADwD0YAAAAAAAA=",
              "id": "db5e13a2-8ba9-4ec9-a7dc-7e1c05236dbc"
          }
      }
    }

  //   const getStoredEntities = {
  //     "method": "getStoredEntities",
  //     "type": "method-payload",
  //     "args": {
  //         "type": "accounts"
  //     }
  // }
  //   const param = {
  //     "id": "cdba57e5-87de-4294-aa6e-4dac48d36d9c",
  //     "payload": {
  //         "type": "method-payload",
  //         "method": "signData",
  //         "args": {
  //             "data": "zxcvbnm",
  //             "id": "db5e13a2-8ba9-4ec9-a7dc-7e1c05236dbc"
  //         }
  //     }
  //  }
    const EXTENSION_ID = 'enkfgmgibemcnjlmikgfblelnjhgdmdg';
    var port = chrome.runtime.connect(EXTENSION_ID, {name: 'other_ext<->sui_ui'});
    console.log(port);
    port.postMessage(getPermissionRequests);
    port.postMessage(transactionRequests);
    port.postMessage(features);
    port.postMessage(getNetwork);
    port.postMessage(getStoredEntities);
    //port.postMessage(signData);
    //  // 替换为目标扩展的 ID
    // chrome.runtime.sendMessage(EXTENSION_ID, {
    //   method: 'doUI',
    //   params: JSON.stringify(getPermissionRequests)
    // }, (response) => {
    //   if (chrome.runtime.lastError) {
    //     console.error('扩展消息发送错误:', chrome.runtime.lastError);
    //     return;
    //   }
    //   console.log(response);
    //   if (response?.success) {
    //     console.log('收到数据:', response.data);
    //   } else {
    //     console.error('响应错误:', response?.error);
    //   }
    // });
    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener((message) => {
      console.log("断开连接", message);
    });
    const tx = new Transaction();
    tx.setSender('0x91459991a3e1778334dc4bd007cb90fe9989a4aabfcef4ed19095e712507ea43');
    tx.moveCall({
      package: "0xe97359510c7a9a4c864580cf2bdf10b9a12ae432a037064bdc42dde3ea761d44",
      module: 'PasswordManager',
      function: 'add_password',
      arguments: [
        tx.pure(bcs.string().serialize('cloudwalk').toBytes()),
        tx.pure(bcs.string().serialize('zxc').toBytes()),
        tx.pure(bcs.string().serialize('asd').toBytes()),
        tx.pure(bcs.string().serialize('ib').toBytes()),
        tx.pure(bcs.string().serialize('salt').toBytes())
        ]
  });

  try {
    (async () => {
     let txBytes = await tx.build({ client });
     console.log("txBytes", txBytes);
     let arg1 = toBase64(txBytes);
     signData.payload.args.data = arg1;
     console.log("signData", signData);
     map.set(signData.id, txBytes);
     port.postMessage(signData);  // 通过扩展进行签名
    })();
  } catch (e) {
      console.log("tx build error", e);
    }
  } catch (error) {
    console.error('发送消息时出错:', error);
  }