import env from "./environment.server.js";

let store = null;

if (env.electron) {
    const Store = require('electron-store');
    if (!store) {
        store = new Store();
    }
}

export default store;
