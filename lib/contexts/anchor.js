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
exports.AnchorProvider = exports.useAnchor = void 0;
const react_1 = __importStar(require("react"));
const anchor = __importStar(require("@project-serum/anchor"));
const web3_js_1 = require("@solana/web3.js");
const honey_json_1 = __importDefault(require("../idl/devnet/honey.json"));
const honey_json_2 = __importDefault(require("../idl/mainnet-beta/honey.json"));
const AnchorContext = react_1.default.createContext(null);
const useAnchor = () => {
    const context = (0, react_1.useContext)(AnchorContext);
    return context;
};
exports.useAnchor = useAnchor;
const AnchorProvider = ({ children, wallet, connection, network }) => {
    const [program, setProgram] = (0, react_1.useState)({});
    const [coder, setAnchorCoder] = (0, react_1.useState)({});
    const [isConfigured, setIsConfigured] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // setup coder for anchor operations
        const setup = async () => {
            const idl = network === 'devnet' ? honey_json_1.default : honey_json_2.default;
            setAnchorCoder(new anchor.Coder(idl));
            // init program
            const HONEY_PROGRAM_ID = new web3_js_1.PublicKey(idl.metadata.address);
            const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions());
            const anchorProgram = new anchor.Program(idl, HONEY_PROGRAM_ID, provider);
            setProgram(anchorProgram);
            setIsConfigured(true);
        };
        if (connection && wallet)
            setup();
    }, [connection, wallet]);
    return (react_1.default.createElement(AnchorContext.Provider, { value: {
            program,
            coder,
            isConfigured
        } }, children));
};
exports.AnchorProvider = AnchorProvider;
//# sourceMappingURL=anchor.js.map