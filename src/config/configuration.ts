export interface IConfig {
    // server port (PORT)
    port: number;
    // comma separated list of API keys (API_KEYS)
    api_keys: string[];
    // // RPC endpoint (RPC)
    // rpcETH: string;
    // rpcFLR: string;
    // rpcSGB: string;
    getRPCSource: IGetRPCSource;
    isTestnet: boolean;
}

export type EVMTransactionSources = "ETH" | "FLR" | "SGB";
export type IGetRPCSource = (source: EVMTransactionSources) => string;

function getRPCSource(source: EVMTransactionSources): string {
    switch (source) {
        case "ETH":
            return process.env.RPC_ETH || "https://flare-api.flare.network/ext/C/rpc";
        case "FLR":
            return process.env.RPC_FLR || "https://flare-api.flare.network/ext/C/rpc";
        case "SGB":
            return process.env.RPC_SGB || "https://flare-api.flare.network/ext/C/rpc";
    }
}

export default () => {
    const api_keys = process.env.API_KEYS?.split(",") || [""];
    const isTestnet = process.env.TESTNET == "true";
    const config: IConfig = {
        port: parseInt(process.env.PORT || "3000"),
        api_keys,
        getRPCSource: (source: EVMTransactionSources) => getRPCSource(source),
        isTestnet,
    };
    return config;
};
