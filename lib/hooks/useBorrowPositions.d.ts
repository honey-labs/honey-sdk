import { Connection, PublicKey } from '@solana/web3.js';
import { ConnectedWallet } from 'src/helpers/walletType';
import { TBorrowPosition } from '../helpers/types';
export declare const METADATA_PROGRAM_ID: PublicKey;
export declare const useBorrowPositions: (connection: Connection, wallet: ConnectedWallet, honeyId: string, honeyMarketId: string) => {
    loading: boolean;
    data?: TBorrowPosition[];
    error?: Error;
};
