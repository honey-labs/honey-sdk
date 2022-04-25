"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawCollateral = exports.withdraw = exports.depositCollateral = exports.deposit = void 0;
const honeyTypes_1 = require("../helpers/honeyTypes");
const wrappers_1 = require("../wrappers");
const borrow_1 = require("./borrow");
const deposit = async (honeyUser, tokenAmount, depositTokenMint, depositReserves) => {
    const depositReserve = depositReserves.filter((reserve) => reserve.data.tokenMint.equals(depositTokenMint))[0];
    const associatedTokenAccount = await (0, borrow_1.deriveAssociatedTokenAccount)(depositTokenMint, honeyUser.address);
    const amount = wrappers_1.Amount.tokens(tokenAmount);
    if (!associatedTokenAccount) {
        console.error(`Could not find the associated token account: ${associatedTokenAccount}`);
        return [honeyTypes_1.TxnResponse.Failed, []];
    }
    return await honeyUser.deposit(depositReserve, associatedTokenAccount, amount);
};
exports.deposit = deposit;
const depositCollateral = async (honeyUser, tokenAmount, depositTokenMint, depositReserves) => {
    const depositReserve = depositReserves.filter((reserve) => reserve.data.tokenMint.equals(depositTokenMint))[0];
    return await honeyUser.depositCollateral(depositReserve, wrappers_1.Amount.tokens(tokenAmount));
};
exports.depositCollateral = depositCollateral;
const withdraw = async (honeyUser, tokenAmount, withdrawTokenMint, withdrawReserves) => {
    const withdrawReserve = withdrawReserves.filter((reserve) => reserve.data.tokenMint.equals(withdrawTokenMint))[0];
    const associatedTokenAccount = await (0, borrow_1.deriveAssociatedTokenAccount)(withdrawTokenMint, honeyUser.address);
    const amount = wrappers_1.Amount.tokens(tokenAmount);
    if (!associatedTokenAccount) {
        console.error(`Could not find the associated token account: ${associatedTokenAccount}`);
        return [honeyTypes_1.TxnResponse.Failed, []];
    }
    return await honeyUser.withdraw(withdrawReserve, associatedTokenAccount, amount);
};
exports.withdraw = withdraw;
const withdrawCollateral = async (honeyUser, tokenAmount, withdrawTokenMint, withdrawReserves) => {
    const withdrawReserve = withdrawReserves.find((reserve) => reserve.data.tokenMint.equals(withdrawTokenMint));
    if (!withdrawReserve) {
        console.error(`Reserve with token mint ${withdrawTokenMint} does not exist`);
        return [honeyTypes_1.TxnResponse.Failed, []];
    }
    const withdrawCollateralTx = await honeyUser.withdrawCollateral(withdrawReserve, wrappers_1.Amount.tokens(tokenAmount));
    return withdrawCollateralTx;
};
exports.withdrawCollateral = withdrawCollateral;
//# sourceMappingURL=lend.js.map