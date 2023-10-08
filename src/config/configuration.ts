export interface IConfig {
    // server port (PORT)
    port: number;
    // comma separated list of API keys (API_KEYS)
    api_keys: string[];
    // RPC endpoint (RPC)
    rpc: string;
}

export default () => {
    const api_keys = process.env.API_KEYS?.split(",") || [""];
    const config: IConfig = {
        port: parseInt(process.env.PORT || "3000"),
        api_keys,
        rpc: process.env.RPC || "https://flare-api.flare.network/ext/C/rpc",
    };
    return config;
};
