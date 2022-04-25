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
exports.useMarket = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const web3_js_1 = require("@solana/web3.js");
const react_1 = require("react");
const __1 = require("..");
const anchor_1 = require("../contexts/anchor");
const useMarket = (connection, wallet, honeyProgramId, honeyMarketId) => {
    const { isConfigured } = (0, anchor_1.useAnchor)();
    const [honeyClient, setHoneyClient] = (0, react_1.useState)();
    const [honeyMarket, setHoneyMarket] = (0, react_1.useState)();
    const [honeyUser, setHoneyUser] = (0, react_1.useState)();
    const [honeyReserves, setHoneyReserves] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        const fetchHoneyClient = async () => {
            if (!wallet)
                return;
            const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions());
            const client = await __1.HoneyClient.connect(provider, honeyProgramId, true);
            setHoneyClient(client);
            const honeyMarketPubKey = new web3_js_1.PublicKey(honeyMarketId);
            const market = await __1.HoneyMarket.load(client, honeyMarketPubKey);
            setHoneyMarket(market);
            // pull latest reserve data
            market.refresh();
            const reserves = market.reserves.map(reserve => new __1.HoneyReserve(client, market, reserve.address));
            Promise.all(reserves.map(async (reserve) => {
                if (reserve.address && reserve.address.toBase58() !== web3_js_1.PublicKey.default.toBase58())
                    await reserve.refresh();
            }));
            setHoneyReserves(reserves);
            const user = await __1.HoneyUser.load(client, market, new web3_js_1.PublicKey(wallet.publicKey), reserves);
            setHoneyUser(user);
        };
        // load jet
        if (isConfigured && wallet && connection && honeyProgramId && honeyMarketId) {
            fetchHoneyClient();
        }
    }, [isConfigured, connection, wallet, honeyProgramId, honeyMarketId]);
    return {
        honeyClient,
        setHoneyClient,
        honeyMarket,
        setHoneyMarket,
        honeyUser,
        setHoneyUser,
        honeyReserves,
        setHoneyReserves,
    };
};
exports.useMarket = useMarket;
//# sourceMappingURL=useMarket.js.map