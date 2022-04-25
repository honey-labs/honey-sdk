import { PublicKey } from '@solana/web3.js';
import { HoneyReserve, HoneyUser } from '../wrappers';
import { TxResponse } from './types';
export declare const deposit: (honeyUser: HoneyUser, tokenAmount: number, depositTokenMint: PublicKey, depositReserves: HoneyReserve[]) => Promise<TxResponse>;
export declare const depositCollateral: (honeyUser: HoneyUser, tokenAmount: number, depositTokenMint: PublicKey, depositReserves: HoneyReserve[]) => Promise<TxResponse>;
export declare const withdraw: (honeyUser: HoneyUser, tokenAmount: number, withdrawTokenMint: PublicKey, withdrawReserves: HoneyReserve[]) => Promise<TxResponse>;
export declare const withdrawCollateral: (honeyUser: HoneyUser, tokenAmount: number, withdrawTokenMint: PublicKey, withdrawReserves: HoneyReserve[]) => Promise<TxResponse>;
