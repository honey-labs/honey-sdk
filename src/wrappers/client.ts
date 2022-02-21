import { PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { CreateMarketParams, JetMarket } from './market';
import { PROGRAM_IDLS } from '../helpers/idls';
import { DerivedAccount } from './derived-account';

interface ToBytes {
  toBytes(): Uint8Array;
}

interface HasPublicKey {
  publicKey: PublicKey;
}

type DerivedAccountSeed = HasPublicKey | ToBytes | Uint8Array | string;

export class JetClient {
  constructor(public program: anchor.Program, public devnet?: boolean) {}

  /**
   * Create a new client for interacting with the Jet lending program.
   * @param provider The provider with wallet/network access that can be used to send transactions.
   * @returns The client
   */
  static async connect(provider: anchor.Provider, jetId: string, devnet?: boolean): Promise<JetClient> {
    const network = devnet ? 'devnet' : 'mainnet-beta';
    const idl = PROGRAM_IDLS.filter((value) => value.name === network)[0];
    const JET_ID = new PublicKey(jetId);
    const program = new anchor.Program(idl.jet, JET_ID, provider);

    return new JetClient(program, devnet);
  }

  /**
   * Find a PDA
   * @param seeds
   * @returns
   */
  async findDerivedAccount(seeds: DerivedAccountSeed[]): Promise<DerivedAccount> {
    const seedBytes = seeds.map((s) => {
      if (typeof s === 'string') {
        return Buffer.from(s);
      } else if ('publicKey' in s) {
        return s.publicKey.toBytes();
      } else if ('toBytes' in s) {
        return s.toBytes();
      } else {
        return s;
      }
    });
    const [address, bumpSeed] = await PublicKey.findProgramAddress(seedBytes, this.program.programId);
    return new DerivedAccount(address, bumpSeed);
  }

  async createMarket(params: CreateMarketParams): Promise<JetMarket> {
    let account = params.account;

    if (account === undefined) {
      account = Keypair.generate();
    }

    await this.program.rpc.initMarket(
      params.owner,
      params.quoteCurrencyName,
      params.quoteCurrencyMint,
      params.updateAuthority,
      {
        accounts: {
          market: account.publicKey,
          oraclePrice: params.oraclePrice,
          oracleProduct: params.oracleProduct,
        },
        signers: [account],
        instructions: [await this.program.account.market.createInstruction(account)],
      },
    );

    return JetMarket.load(this, account.publicKey);
  }
}