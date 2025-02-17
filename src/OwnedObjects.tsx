import {  useSuiClientQuery, useSuiClient, useAccounts } from "@mysten/dapp-kit";
import { useEffect } from 'react';
//import { SuiClient, SuiClientOptions } from '@mysten/sui/client';
import { Buffer } from 'buffer';
//import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
//import { fromHex } from '@mysten/bcs';
import { Flex,Heading, Text } from "@radix-ui/themes";



function generateAddressFromPrivateKey(mnemonic: string): string {
// 助记词
//const mnemonic = 'result crisp session latin ...'; // 替换为你的助记词

// 派生路径（默认路径）
const derivationPath = "m/44'/784'/0'/0'/0'";

// 通过助记词派生密钥对
const keypair = Ed25519Keypair.deriveKeypair(mnemonic, derivationPath);

// 获取私钥
const privateKey = keypair.getSecretKey();
console.log('Private Key:', privateKey);

// 获取公钥和地址
const publicKey = keypair.getPublicKey();
const address = publicKey.toSuiAddress();
console.log('Public Key:', publicKey.toBase64());
console.log('Sui Address:', address);
return privateKey;
}

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

export function OwnedObjects() {
  useAccounts
  const suiClient = useSuiClient();
  console.log(suiClient);
// 使用 chrome.runtime.id 获取当前扩展的ID
const sendMessageToBackground = () => {
  if (chrome?.runtime?.id) {
    try {


      const getPermissionRequests = {
          "type": "get-permission-requests"
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
      const EXTENSION_ID = 'enkfgmgibemcnjlmikgfblelnjhgdmdg'; // 替换为目标扩展的 ID
      chrome.runtime.sendMessage(EXTENSION_ID, {
        method: 'doUI',
        params: JSON.stringify(getPermissionRequests)
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('扩展消息发送错误:', chrome.runtime.lastError);
          return;
        }
        console.log(response);
        if (response?.success) {
          console.log('收到数据:', response.data);
        } else {
          console.error('响应错误:', response?.error);
        }
      });
    } catch (error) {
      console.error('发送消息时出错:', error);
    }
  } else {
    console.log('Chrome扩展环境未就绪');
  }
};

// 在组件中调用
useEffect(() => {
  sendMessageToBackground();
}, []);
  //    readonly address: string;

    /** Public key of the account, corresponding with a secret key to use. */
    //readonly publicKey: ReadonlyUint8Array;
  const account = {
    "address":"0x91459991a3e1778334dc4bd007cb90fe9989a4aabfcef4ed19095e712507ea43",
    "publicKeyBase64":"AI0r1mnkV381AFG9PtotmT6MQBS4qhxrLWKxPgM4EWEm",
    "publicKey": new Uint8Array(Buffer.from("AI0r1mnkV381AFG9PtotmT6MQBS4qhxrLWKxPgM4EWEm", 'base64'))
  };
  console.log(account)
  let address = account;
  console.log(address);
  // const tx = new Transaction();
  // tx.setSender(address.address);
  // tx.moveCall({
  //   arguments: [tx.object(' 0x2f0afe5c95a5005ed8f0253f0bcb7222ba762d4a508591aea0926c2f08183238')],
  //   target: `0xbf2358afa97c547af774ff26f468f717ea7ad8fb514cb6ff0798f6cfe53d9636::counter::increment`,
  // });
  // // 签名并发送交易
  // const signer = new Signer();
  // const response = await suiClient.signAndExecuteTransaction({
  //   transaction: tx,
  //   signer: account
  // });
  // console.log('交易响应:', response);
  // 设置交易发送者

  //
  //const storedData = sessionStorage.getItem("aed246cd-2812-481b-a973-844d9a497381");
  const googleData = sessionStorage.getItem("db5e13a2-8ba9-4ec9-a7dc-7e1c05236dbc");
  console.log(googleData)
  const mnemonic = 'pupil annual unique response volcano drum deny float book farm ride buzz';
  const privateKey = generateAddressFromPrivateKey(mnemonic);
  console.log('Generated privateKey:', privateKey);
            // 签名并执行交易

  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  if (!account) {
    return;
  }

  if (error) {
    return <Flex>Error: {error.message}</Flex>;
  }

  if (isPending || !data) {
    return <Flex>Loading...</Flex>;
  }

  

  return (
    <Flex direction="column" my="2">
      {data.data.length === 0 ? (
        <Text>No objects owned by the connected wallet</Text>
      ) : (
        <Heading size="4">Objects owned by the connected wallet</Heading>
      )}
      {data.data.map((object) => (
        <Flex key={object.data?.objectId}>
          <Text>Object ID: {object.data?.objectId}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
