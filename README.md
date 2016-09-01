This repository contains [webtask compilers](https://webtask.io/docs/webtask-compilers) that enable custom programming models for Auth0 platform extensibility points. 

This module is installed on the webtask platform via the [webtask-mongo](https://github.com/auth0/webtask-mongo) docker image. 

## Creating Auth0 extensions with *wt-cli*

To create a webtask that implements a specific extensibility point, you can use the `wt-cli` tool or a corresponding webtask API call. For example, to create a *client-credentials-exchange* extension you could call: 

```bash
cat > custom_claims.js <<EOF
module.exports = function(client, scope, audience, context, cb) {
  var access_token = {};
  access_token['https://foo.com/claim'] = 'bar';  
  access_token.scope = scope;
  access_token.scope.push('extra');
  cb(null, access_token);  
};EOF

SECRET=$(openssl rand 32 -base64) && \
wt create custom_claims.js \
    -p default-tjanczuk \
    --meta wt-compiler=auth0-ext-compilers/client-credentials-exchange \
    --meta auth0-extension=runtime \
    --meta auth0-extension-name=client-credentials-exchange \
    --meta auth0-extension-secret=$SECRET \
    --secret auth0-extension-secret=$SECRET
```

## What is Auth0 extension

Auth0 extension is a webtask created in the Auth0 tenant's webtask container and associated with specific metadata properties as outlined in the table below. 

|  Name  |  Required?  |  Value  |
| --- | --- | --- |
| `auth0-extension`  | Yes | Must be set to `runtime`. |
| `auth0-extension-name` | Yes | The name of the extensibility point in Auth0. This is used by Auth0 to select the set of webtasks to run in a specific place and circumstances of Auth0 processing. Currently only the value of `client-credentials-exchange` is supported but the list will grow as we add new extension points. |
| `auth0-extension-client` | No | Auth0 extension points which only wish to execute extensions configured for a particular client_id will use this value to select the webtasks that should be run. |
| `auth0-extension-disabled` | No | If set, disables the webtask. |
| `auth0-extension-order` | No | Webtasks selected to run for a given extension point in Auth0 will be sorted following an increasing order of this numeric metadata property. If not specified, `0` is assumed. Order of webtasks with the same value of `auth0-extension-order` is indeterministic. |
| `auth0-extension-no-cache` | No | If set, prevents caching of webtask code at runtime. Useful during development. |
| `auth0-extension-secret` | No | Used to authorize calls from Auth0 to Webtasks. See below. |

## Authorization

Auth0 extensions are executed by issuing an HTTP POST request to the webtask URL from Auth0 runtime. To ensure only Auth0 runtime and/or a specific Auth0 tenant can issue such requests, the requests use a secret-based authorization mechanism. If an extension webtask has been created with `auth0-extension-secret` secret parameter, the value of that parameter MUST equal to the value of the `Authorization: Bearer {secret}` header of the HTTP POST request. To allow Auth0 runtime to add the necessary header to the webtask request it is making, the same secret value is stored in the `auth0-extension-secret` metadata property. This setup can be achieved with the following: 

```bash
SECRET=$(openssl rand 32 -base64) && \
wt create {file}.js \
    --meta wt-compiler=auth0-ext-compilers/{specific-compiler} \
    --meta auth0-extension-secret=$SECRET \
    --secret auth0-extension-secret=$SECRET \
    ...
```

The authorization check is implemented as part of the webtask compiler for a specific extensibility point - see next section.

## Custom programming models

Different Auth0 extensibility points may present unique programming models to the end user with the use of [webtask compilers](https://webtask.io/docs/webtask-compilers). Webtask compilers for Auth0 extensibility points are implemented as part of this repository which is installed as a Node.js module in the webtask environment. This allows the use of `wt-compiler` metadata property to select a specific compiler, e.g. with: 

```bash
wt create {file}.js \
    --meta wt-compiler=auth0-ext-compilers/client-credentials-exchange \
    ...
```

Webtask compilers for Auth0 extension points also enforce the authorization check described in the previous section. 

### The *client-credentials-exchange* extensibility point

The *client-credentials-exchange* extensibility point allows custom code to modify the scopes and add custom claims to the tokens issued from the `POST /oauth/token` Auth0 API.

#### Request body

```javascript
{
  "audience": "string",
  "client": {
    "name": "string",
    "id": "string",
    "metadata": "object",
    "tenant": "string"
  },
  "scope": "array of strings"
}
```

#### Response body

```javascript
{
  "scope": "array of strings"
  // other properties with namespaced property names
}
```

The `scope` property of the response as well as any other properties with names that: 

* are URLs with `http` or `https` schemes
* have hostnames other than `auth0.com`, `webtask.io`, `webtask.run`, or subordinate domain names

will be added as claims to the token being issued. All other response properties are ignored. 

#### Programming model

**client-credentials-exchange**:

```javascript
/**
@param {object} client - information about the client
@param {string} client.name - name of client
@param {string} client.id - client id
@param {string} client.tenant - Auth0 tenant name
@param {object} client.metadata - client metadata
@param {array|undefined} scope - array of strings representing the scope claim or undefined
@param {string} audience - token's audience claim
@param {object} context - additional authorization context
@param {object} context.webtask - the raw webtask context object
@param {function} cb - function (error, accessTokenClaims)
*/
module.exports = function (client, scope, audience, context cb) {
  // call the callback with an error to signal authorization failure
  // or with a mapping of claims to values (including scopes).
  cb(null, { claim: 'value' }); // return error or a mapping of access token claims
};
```
