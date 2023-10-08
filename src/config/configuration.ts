export interface IConfig {
    port: number;
    api_keys: string[];
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
