export default {
    webUrl: process.env.WEB_URL ?? "http://localhost:3000",
    readHotUrl: process.env.READ_HOT_URL ?? "http://localhost:3005/v1",
    writeHotUrl: process.env.WRITE_HOT_URL ?? "http://localhost:3005/v1",
    wsUrl: process.env.WS_URL ?? "ws://localhost:3006/ws",
    electron: !!process.env.ELECTRON ? process.env.ELECTRON === "true" : true,
    wikidHeader: process.env.X_WICKED_HEADER ?? "8041c9f3768f7bb2e39eab09f9d6b9e12cc6a4d",
    gitCommitSha: process.env.RAILWAY_GIT_COMMIT_SHA ?? "1",
}
