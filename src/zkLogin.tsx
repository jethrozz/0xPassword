
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
const FULLNODE_URL = 'https://fullnode.testnet.sui.io'; // replace with the RPC URL you want to use
const suiClient = new SuiClient({ url: FULLNODE_URL });
const { epoch, epochDurationMs, epochStartTimestampMs } = await suiClient.getLatestSuiSystemState();

const maxEpoch = Number(epoch) + 2; // this means the ephemeral key will be active for 2 epochs from now.
const ephemeralKeyPair = new Ed25519Keypair();
const randomness = generateRandomness();
const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

console.log(nonce);