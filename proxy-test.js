import HttpTargetServer from "./HttpTargetServer";
import ProxyServer from "./ProxyServer";

const apiServer = new HttpTargetServer();
const webServer = new HttpTargetServer();

apiServer.init({
    port : 8097,
    root : "api"
});

webServer.init({
    port : 8098,
    root : ""
});

const server = process.env.OPENSHIFT_NODEJS_IP || "localhost";

const proxy = new ProxyServer();
const opts = {
    api : {
        server,
        port : 8097,
        root : "api"
    },
    web : {
        server,
        port : 8098,
        root : ""
    }
};

try {
    proxy.initialize(opts);
} catch (e) {
    console.error(`Error initializing proxy with options ${JSON.stringify(opts, null, " ")}: ${e}`);
}

try {
    proxy.start();
} catch (e) {
    console.error(`Error starting proxy with options ${JSON.stringify(opts, null, " ")}: ${e}`);
}


