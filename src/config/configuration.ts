export interface IConfig {
    // server port (PORT)
    port: number;
    // comma separated list of API keys (API_KEYS)
    api_keys: string[];
    // RPC endpoint (RPC)
    rpcETH: string;
    rpcFLR: string;
}

export default () => {
    const api_keys = process.env.API_KEYS?.split(",") || [""];
    const config: IConfig = {
        port: parseInt(process.env.PORT || "3000"),
        api_keys,
        rpcFLR: process.env.RPC_FLR || "https://flare-api.flare.network/ext/C/rpc",
        rpcETH: process.env.RPC_ETH || "https://flare-api.flare.network/ext/C/rpc",
    };
    return config;
};
