import React, { FC, ReactNode } from 'react';
import { AssetStore, Market, User } from '../helpers/honeyTypes';
import { ConnectedWallet } from '../helpers/walletType';
import { Connection } from '@solana/web3.js';
interface HoneyContext {
    market: Market;
    user: User;
    assetStore: AssetStore | null;
}
declare const HoneyContext: React.Context<HoneyContext>;
export declare const useHoney: () => HoneyContext;
export interface HoneyProps {
    children: ReactNode;
    wallet: ConnectedWallet | null;
    connection: Connection;
    honeyProgramId: string;
    honeyMarketId: string;
}
export declare const HoneyProvider: FC<HoneyProps>;
export {};
