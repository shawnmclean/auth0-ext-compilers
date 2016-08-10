This repository contains [webtask compilers](https://webtask.io/docs/webtask-compilers) that enable custom programming models for Auth0 platform extensibility points. 

This module is installed on the webtask platform via the [webtask-mongo](https://github.com/auth0/webtask-mongo) docker image. 

To create a webtask that implements a specific extensibility point, you can use the `wt-cli` tool or a corresponding webtask API call. For example, to create a *credentials-exchange* extension you could call: 

```bash
cat > custom_claims.js <<EOF
module.exports = function (ctx, cb) {
    ctx.access_token.foo = 'bar';
    cb(null, ctx);  
};
EOF

SECRET=$(openssl rand 32 -base64) && \
wt create custom_claims.js \
    -p default-tjanczuk \
    --meta wt-compiler=auth0-ext-compilers/credentials-exchange \
    --meta auth0-extension=runtime \
    --meta auth0-extension-name=credentials-exchange \
    --meta auth0-extension-secret=$SECRET \
    --secret auth0-extension-secret=$SECRET
```
