"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoneyClient = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor = __importStar(require("@project-serum/anchor"));
const market_1 = require("./market");
const derived_account_1 = require("./derived-account");
const honey_json_1 = __importDefault(require("../idl/devnet/honey.json"));
const honey_json_2 = __importDefault(require("../idl/mainnet-beta/honey.json"));
class HoneyClient {
    constructor(program, devnet) {
        this.program = program;
        this.devnet = devnet;
    }
    /**
     * Create a new client for interacting with the Jet lending program.
     * @param provider The provider with wallet/network access that can be used to send transactions.
     * @returns The client
     */
    static async connect(provider, honeyPubKey, devnet) {
        const idl = devnet ? honey_json_1.default : honey_json_2.default;
        const HONEY_PROGRAM_ID = new web3_js_1.PublicKey(honeyPubKey);
        const program = new anchor.Program(idl, HONEY_PROGRAM_ID, provider);
        return new HoneyClient(program, devnet);
    }
    /**
     * Find a PDA
     * @param seeds
     * @returns
     */
    async findDerivedAccount(seeds) {
        const seedBytes = seeds.map((s) => {
            if (typeof s === 'string') {
                return Buffer.from(s);
            }
            else if ('publicKey' in s) {
                return s.publicKey.toBytes();
            }
            else if ('toBytes' in s) {
                return s.toBytes();
            }
            else {
                return s;
            }
        });
        const [address, bumpSeed] = await web3_js_1.PublicKey.findProgramAddress(seedBytes, this.program.programId);
        return new derived_account_1.DerivedAccount(address, bumpSeed);
    }
    async createMarket(params) {
        let account = params.account;
        console.log('programID when creating market', this.program.programId.toString());
        if (account === undefined) {
            account = web3_js_1.Keypair.generate();
        }
        await this.program.rpc.initMarket(params.owner, params.quoteCurrencyName, params.quoteCurrencyMint, params.nftCollectionCreator, {
            accounts: {
                market: account.publicKey,
            },
            signers: [account],
            instructions: [await this.program.account.market.createInstruction(account)],
        });
        return market_1.HoneyMarket.load(this, account.publicKey);
    }
}
exports.HoneyClient = HoneyClient;
//# sourceMappingURL=client.js.map