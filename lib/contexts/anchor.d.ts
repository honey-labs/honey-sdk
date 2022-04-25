import { Program } from '@project-serum/anchor';
import { FC, ReactNode } from 'react';
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { ConnectedWallet } from '../helpers/walletType';
export interface AnchorContext {
    program: Program;
    coder: anchor.Coder;
    isConfigured: boolean;
}
export declare const useAnchor: () => AnchorContext;
export interface Wallet {
    signTransaction(tx: Transaction): Promise<Transaction>;
    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
    publicKey: PublicKey;
}
export interface AnchorProviderProps {
    children: ReactNode;
    wallet: ConnectedWallet | null;
    connection: Connection;
    network: string;
}
export declare const AnchorProvider: FC<AnchorProviderProps>;
