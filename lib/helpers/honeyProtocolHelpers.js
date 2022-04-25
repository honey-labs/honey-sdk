"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetPubkeys = exports.getReserveStructures = void 0;
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const spl_token_2 = require("@solana/spl-token");
const programUtil_1 = require("./programUtil");
const util_1 = require("./util");
const getReserveStructures = async (honeyReserves) => {
    // Setup reserve structures
    const reserves = {};
    for (const reserveMeta of honeyReserves) {
        if (!reserveMeta || !reserveMeta.data || !reserveMeta.state)
            continue;
        const reserve = {
            name: reserveMeta.address.toString(),
            abbrev: reserveMeta.address.toString(),
            marketSize: util_1.TokenAmount.zero(0),
            outstandingDebt: util_1.TokenAmount.zero(0),
            utilizationRate: 0,
            depositRate: 0,
            borrowRate: 0,
            maximumLTV: 0,
            liquidationPremium: 0,
            price: 0,
            decimals: 0,
            depositNoteExchangeRate: new anchor_1.BN(0),
            loanNoteExchangeRate: new anchor_1.BN(0),
            accruedUntil: new anchor_1.BN(0),
            config: {
                utilizationRate1: 0,
                utilizationRate2: 0,
                borrowRate0: 0,
                borrowRate1: 0,
                borrowRate2: 0,
                borrowRate3: 0,
                minCollateralRatio: 0,
                liquidationPremium: 0,
                manageFeeCollectionThreshold: new anchor_1.BN(0),
                manageFeeRate: 0,
                loanOriginationFee: 0,
                liquidationSlippage: 0,
                _reserved0: 0,
                liquidationDexTradeMax: 0,
                _reserved1: [],
            },
            accountPubkey: reserveMeta.address,
            vaultPubkey: reserveMeta.data.vault,
            availableLiquidity: util_1.TokenAmount.zero(0),
            feeNoteVaultPubkey: reserveMeta.data.feeNoteVault,
            tokenMintPubkey: reserveMeta.data.tokenMint,
            tokenMint: util_1.TokenAmount.zero(0),
            faucetPubkey: null,
            depositNoteMintPubkey: reserveMeta.data.depositNoteMint,
            depositNoteMint: util_1.TokenAmount.zero(0),
            loanNoteMintPubkey: reserveMeta.data.loanNoteMint,
            loanNoteMint: util_1.TokenAmount.zero(0),
            pythPricePubkey: reserveMeta.data.pythPrice,
            pythProductPubkey: reserveMeta.data.pythProduct,
        };
        reserves[reserveMeta.address.toString()] = reserve;
    }
    return reserves;
};
exports.getReserveStructures = getReserveStructures;
// Get user token accounts
const getAssetPubkeys = async (market, user, program, wallet) => {
    if (program == null || wallet === null) {
        return null;
    }
    let [obligationPubkey, obligationBump] = await (0, programUtil_1.findObligationAddress)(program, market.accountPubkey, wallet.publicKey);
    let assetStore = {
        sol: new util_1.TokenAmount(new anchor_1.BN(0), programUtil_1.SOL_DECIMALS),
        obligationPubkey,
        obligationBump,
        tokens: {},
    };
    for (const assetAbbrev in market.reserves) {
        let reserve = market.reserves[assetAbbrev];
        let tokenMintPubkey = reserve.tokenMintPubkey;
        let [depositNoteDestPubkey, depositNoteDestBump] = await (0, programUtil_1.findDepositNoteDestAddress)(program, reserve.accountPubkey, wallet.publicKey);
        let [depositNotePubkey, depositNoteBump] = await (0, programUtil_1.findDepositNoteAddress)(program, reserve.accountPubkey, wallet.publicKey);
        let [loanNotePubkey, loanNoteBump] = await (0, programUtil_1.findLoanNoteAddress)(program, reserve.accountPubkey, obligationPubkey, wallet.publicKey);
        let [collateralPubkey, collateralBump] = await (0, programUtil_1.findCollateralAddress)(program, reserve.accountPubkey, obligationPubkey, wallet.publicKey);
        let asset = {
            tokenMintPubkey,
            walletTokenPubkey: await spl_token_2.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_2.TOKEN_PROGRAM_ID, tokenMintPubkey, wallet.publicKey),
            walletTokenExists: false,
            walletTokenBalance: util_1.TokenAmount.zero(reserve.decimals),
            depositNotePubkey,
            depositNoteBump,
            depositNoteExists: false,
            depositNoteBalance: util_1.TokenAmount.zero(reserve.decimals),
            depositBalance: util_1.TokenAmount.zero(reserve.decimals),
            depositNoteDestPubkey,
            depositNoteDestBump,
            depositNoteDestExists: false,
            depositNoteDestBalance: util_1.TokenAmount.zero(reserve.decimals),
            loanNotePubkey,
            loanNoteBump,
            loanNoteExists: false,
            loanNoteBalance: util_1.TokenAmount.zero(reserve.decimals),
            loanBalance: util_1.TokenAmount.zero(reserve.decimals),
            collateralNotePubkey: collateralPubkey,
            collateralNoteBump: collateralBump,
            collateralNoteExists: false,
            collateralNoteBalance: util_1.TokenAmount.zero(reserve.decimals),
            collateralBalance: util_1.TokenAmount.zero(reserve.decimals),
            maxDepositAmount: 0,
            maxWithdrawAmount: 0,
            maxBorrowAmount: 0,
            maxRepayAmount: 0,
        };
        // Set user assets
        assetStore.tokens[assetAbbrev] = asset;
    }
    return assetStore;
};
exports.getAssetPubkeys = getAssetPubkeys;
//# sourceMappingURL=honeyProtocolHelpers.js.map