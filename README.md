# openshift-proxy-sample
Shows how to expose a rest api to a web application in openshift

The Problem
--------

You have a Node web application serving web content.
The web application acquires dynamic content from a REST application running on the same server.
The web application's server port is accessible to the public, but the REST application's is not, 
due to some firewall restriction on the OpenShift cartridge.

Without an answer from the OpenShift community, at least in the short term, this solution proxies all 
requests on the default web port to the private port where the REST application is running.

See [this](http://stackoverflow.com/questions/41971822/openshift-node-rest-service-error-this-site-can-t-be-reached) for a more detailed explanation
 
How this works
--------------

This is ES6 using a babel transpiler, simply because this is taken from another project and isn't instrumental in the solution.

*proxy-test* starts up to HttpTargetServers, which are express web applications that listen to requests on ports 8097 and 8098.
  
Run by typing: `npm run start`

This starts a proxy server on port 3001 that routes any http request to 
* localhost:3001/api/* -> localhost:8097/api
* locathost:3001/* -> localhost:8098

Note that this example doesn't do much more that show that it is possible to 
proxy a request to another port and resource address.  All api requests 
go to /api but will not include any subresources in the specified url.  

To test api forwarding, type `curl localhost:3001/api/products`

You will see something like this:

```javascript
Request successfully proxied to: localhost:8097/api 
headers {
  "user-agent": "express-request-proxy",
  "accept": "*/*",
  "x-forwarded-for": "127.0.0.1",
  "x-forwarded-port": "3001",
  "x-forwarded-host": "localhost",
  "x-forwarded-proto": "http",
  "accept-encoding": "gzip",
  "host": "localhost:8097",
  "connection": "close"
} 
```

Type `curl localhost:3001/web`

And you should see something like this:

```javascript
Request successfully proxied to: localhost:8098/ 
headers {
  "user-agent": "express-request-proxy",
  "accept": "*/*",
  "x-forwarded-for": "127.0.0.1",
  "x-forwarded-port": "3001",
  "x-forwarded-host": "localhost",
  "x-forwarded-proto": "http",
  "accept-encoding": "gzip",
  "host": "localhost:8098",
  "connection": "close"
}
```

If you already have a node express web application, you add a single route
that proxies incoming requests by doing the following:

* Import the npm package [express-request-proxy](https://www.npmjs.com/package/express-request-proxy)
* Add another route similar to this:
```javascript
app.all(`/api/*`, requestProxy({
    url : `http://${restServer}:${restPort}/api/*`
}));
```

This has the effect of forwarding any request that looks like any other 
web request to the casual observer, but proxies it to the rest application
instead.  

