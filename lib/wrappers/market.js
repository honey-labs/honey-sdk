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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketFlags = exports.HoneyMarket = exports.DEX_PID = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const anchor = __importStar(require("@project-serum/anchor"));
const BL = __importStar(require("@solana/buffer-layout"));
const reserve_1 = require("./reserve");
const util = __importStar(require("./util"));
const MAX_RESERVES = 32;
const ReserveInfoStruct = BL.struct([
    util.pubkeyField('address'),
    BL.blob(80, '_UNUSED_0_'),
    util.numberField('price'),
    util.numberField('depositNoteExchangeRate'),
    util.numberField('loanNoteExchangeRate'),
    util.numberField('minCollateralRatio'),
    BL.u16('liquidationBonus'),
    BL.blob(158, '_UNUSED_1_'),
    BL.blob(16, '_CACHE_TAIL'),
]);
const MarketReserveInfoList = BL.seq(ReserveInfoStruct, MAX_RESERVES);
exports.DEX_PID = new web3_js_1.PublicKey('DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY'); // localnet
class HoneyMarket {
    constructor(client, address, quoteTokenMint, quoteCurrency, marketAuthority, owner, reserves, pythOraclePrice, pythOracleProduct, updateAuthority) {
        this.client = client;
        this.address = address;
        this.quoteTokenMint = quoteTokenMint;
        this.quoteCurrency = quoteCurrency;
        this.marketAuthority = marketAuthority;
        this.owner = owner;
        this.reserves = reserves;
        this.pythOraclePrice = pythOraclePrice;
        this.pythOracleProduct = pythOracleProduct;
        this.updateAuthority = updateAuthority;
    }
    static async fetchData(client, address) {
        console.log(address.toString());
        const data = await client.program.account.market.fetch(address);
        const reserveInfoData = new Uint8Array(data.reserves);
        const reserveInfoList = MarketReserveInfoList.decode(reserveInfoData);
        return [data, reserveInfoList];
    }
    /**
     * Load the market account data from the network.
     * @param client The program client
     * @param address The address of the market.
     * @returns An object for interacting with the Honey market.
     */
    static async load(client, address) {
        const [data, reserveInfoList] = await HoneyMarket.fetchData(client, address);
        return new HoneyMarket(client, address, data.quoteTokenMint, data.quoteCurrency, data.marketAuthority, data.owner, reserveInfoList, data.nftPythOraclePrice, data.nftPythOracleProduct, data.updateAuthority);
    }
    /**
     * Get the latest market account data from the network.
     */
    async refresh() {
        const [data, reserveInfoList] = await HoneyMarket.fetchData(this.client, this.address);
        this.reserves = reserveInfoList;
        this.owner = data.owner;
        this.marketAuthority = data.marketAuthority;
        this.quoteCurrency = data.quoteCurrency;
        this.quoteTokenMint = data.quoteTokenMint;
        this.pythOraclePrice = data.pythOraclePrice;
        this.pythOracleProduct = data.pythOracleProduct;
        this.updateAuthority = data.updateAuthority;
    }
    async setFlags(flags) {
        await this.client.program.rpc.setMarketFlags(flags, {
            accounts: {
                market: this.address,
                owner: this.owner,
            },
        });
    }
    async createReserve(params) {
        let account = params.account;
        if (account === undefined) {
            account = web3_js_1.Keypair.generate();
        }
        const derivedAccounts = await reserve_1.HoneyReserve.deriveAccounts(this.client, account.publicKey, params.tokenMint);
        console.log('account.pubkey', account.publicKey.toString());
        const bumpSeeds = {
            vault: derivedAccounts.vault.bumpSeed,
            feeNoteVault: derivedAccounts.feeNoteVault.bumpSeed,
            protocolFeeNoteVault: derivedAccounts.protocolFeeNoteVault.bumpSeed,
            dexOpenOrdersA: derivedAccounts.dexOpenOrdersA.bumpSeed,
            dexOpenOrdersB: derivedAccounts.dexOpenOrdersB.bumpSeed,
            dexSwapTokens: derivedAccounts.dexSwapTokens.bumpSeed,
            loanNoteMint: derivedAccounts.loanNoteMint.bumpSeed,
            depositNoteMint: derivedAccounts.depositNoteMint.bumpSeed,
        };
        const nftDropletAccount = await spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, params.nftDropletMint, this.marketAuthority, true);
        const createReserveAccount = await this.client.program.account.reserve.createInstruction(account);
        const transaction = new web3_js_1.Transaction();
        transaction.add(createReserveAccount);
        const initTx = await (0, web3_js_1.sendAndConfirmTransaction)(this.client.program.provider.connection, transaction, [
            this.client.program.provider.wallet.payer,
            account,
        ]);
        // const init_tx = await this.client.program.provider.send(transaction, [], { skipPreflight: true });
        console.log('init_tx', initTx);
        console.log('accounts', {
            market: this.address.toBase58(),
            marketAuthority: this.marketAuthority.toBase58(),
            reserve: account.publicKey.toBase58(),
            vault: derivedAccounts.vault.address.toBase58(),
            nftDropletMint: params.nftDropletMint.toBase58(),
            nftDropletVault: nftDropletAccount.toBase58(),
            feeNoteVault: derivedAccounts.feeNoteVault.address.toBase58(),
            protocolFeeNoteVault: derivedAccounts.protocolFeeNoteVault.address.toBase58(),
            dexSwapTokens: derivedAccounts.dexSwapTokens.address.toBase58(),
            dexOpenOrdersA: derivedAccounts.dexOpenOrdersA.address.toBase58(),
            dexOpenOrdersB: derivedAccounts.dexOpenOrdersB.address.toBase58(),
            dexMarketA: params.dexMarketA.toBase58(),
            dexMarketB: params.dexMarketB.toBase58(),
            dexProgram: exports.DEX_PID.toBase58(),
            loanNoteMint: derivedAccounts.loanNoteMint.address.toBase58(),
            depositNoteMint: derivedAccounts.depositNoteMint.address.toBase58(),
            oracleProduct: params.pythOracleProduct.toBase58(),
            oraclePrice: params.pythOraclePrice.toBase58(),
            quoteTokenMint: this.quoteTokenMint.toBase58(),
            tokenMint: params.tokenMint.toBase58(),
            owner: this.owner.toBase58(),
        });
        console.log('this.client.program.programID in initing reserve', this.client.program.programId.toString());
        const tx = await this.client.program.rpc.initReserve(bumpSeeds, params.config, {
            accounts: {
                market: this.address,
                marketAuthority: this.marketAuthority,
                reserve: account.publicKey,
                vault: derivedAccounts.vault.address,
                // nftDropletMint: params.nftDropletMint,
                // nftDropletVault: nftDropletAccount,
                feeNoteVault: derivedAccounts.feeNoteVault.address,
                // protocolFeeNoteVault: derivedAccounts.protocolFeeNoteVault.address, // issues
                // dexSwapTokens: derivedAccounts.dexSwapTokens.address,
                // dexOpenOrdersA: derivedAccounts.dexOpenOrdersA.address,
                // dexOpenOrdersB: derivedAccounts.dexOpenOrdersB.address,
                // dexMarketA: params.dexMarketA,
                // dexMarketB: params.dexMarketB,
                dexProgram: exports.DEX_PID,
                loanNoteMint: derivedAccounts.loanNoteMint.address,
                depositNoteMint: derivedAccounts.depositNoteMint.address,
                oracleProduct: params.pythOracleProduct,
                oraclePrice: params.pythOraclePrice,
                quoteTokenMint: this.quoteTokenMint,
                tokenMint: params.tokenMint,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                owner: this.owner,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            // instructions: [createReserveAccount],
            signers: [],
        });
        console.log('initReserve tx', tx);
        return reserve_1.HoneyReserve.load(this.client, account.publicKey, this);
    }
}
exports.HoneyMarket = HoneyMarket;
var MarketFlags;
(function (MarketFlags) {
    MarketFlags[MarketFlags["HaltBorrows"] = 1] = "HaltBorrows";
    MarketFlags[MarketFlags["HaltRepays"] = 2] = "HaltRepays";
    MarketFlags[MarketFlags["HaltDeposits"] = 4] = "HaltDeposits";
    MarketFlags[MarketFlags["HaltAll"] = 7] = "HaltAll";
})(MarketFlags = exports.MarketFlags || (exports.MarketFlags = {}));
//# sourceMappingURL=market.js.map