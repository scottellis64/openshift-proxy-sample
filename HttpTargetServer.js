import http from "http";
import HttpDispatcher from "httpdispatcher";

export default class HttpTargetServer {
    init(opts) {
        const port = opts.port || 4000;
        const root = opts.root;

        const dispatcher = new HttpDispatcher();

        const server = process.env.OPENSHIFT_NODEJS_IP || "localhost";

        dispatcher.onGet(`/${root}`, (req, res) => {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write(`Request successfully proxied to: ${server}:${port}${req.url} \n headers ${JSON.stringify(req.headers, "  ", 2)}\n\n`);
            res.end();
        });

        dispatcher.onError(function(req, res) {
            res.writeHead(404);
            res.end();
        });

        console.log(`Starting HttpTargetServer on ${server}:${port} and root ${root}`);

        try {
            http.createServer((req, resp) => {
                console.log(`Proxied request received on ${server}:${port}, url ${req.url}`);
                dispatcher.dispatch(req, resp);
            }).listen(port, server);
        } catch (e) {
            console.log(`Error starting HttpTargetServer on ${server}:${port}`);
        }
    }
}

