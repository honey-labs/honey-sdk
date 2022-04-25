import { Program } from '@project-serum/anchor';
import { AssetStore, Market, Reserve, User } from './honeyTypes';
import { ConnectedWallet } from './walletType';
import { HoneyReserve } from 'src/wrappers';
export declare const getReserveStructures: (honeyReserves: HoneyReserve[]) => Promise<Record<string, Reserve>>;
export declare const getAssetPubkeys: (market: Market, user: User, program: Program, wallet: ConnectedWallet | null) => Promise<AssetStore | null>;
