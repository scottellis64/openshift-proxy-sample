import express from "express";
import cors from "cors";
import Promise from "promise";
import requestProxy from "express-request-proxy";

export default class ProxyServer {
    static terminator(sig) {
        var date = Date(Date.now());

        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...', date, sig);
            process.exit(1);
        }

        console.log('%s: Node server stopped.', date);
    }

    _setupTerminationHandlers() {
        process.on('exit', () => {
            ProxyServer.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach((element) => {
            process.on(element, () => {
                ProxyServer.terminator(element);
            });
        });
    }

    initialize(opts) {
        this._setupTerminationHandlers();

        this.app = express();
        this.app.use(cors());

        this.app.all(`/${opts.api.root}/*`, requestProxy({
            url : `http://${opts.api.server}:${opts.api.port}/${opts.api.root}`
        }));

        this.app.get(`/*`, requestProxy({
            url : `http://${opts.web.server}:${opts.web.port}`
        }));
    }

    start() {
        return new Promise((resolve) => {
            const server = process.env.OPENSHIFT_NODEJS_IP || "localhost";
            const port = process.env.OPENSHIFT_NODEJS_PORT || "3001";

            console.log(`Starting ProxyServer on ${server}:${port}`);

            this.app.listen(port, server, () => {
                console.log(`${Date(Date.now())}: ProxyServer started on ${server}:${port} ...`);
                resolve();
            });
        });
    }
};
