import { Connection } from '@solana/web3.js';
import { ConnectedWallet } from 'src/helpers/walletType';
import { TPool } from '../helpers/types';
export declare const usePools: (connection: Connection, wallet: ConnectedWallet, honeyProgramId: string, honeyMarketId: string) => {
    loading: boolean;
    data?: TPool[];
    error?: Error;
};
