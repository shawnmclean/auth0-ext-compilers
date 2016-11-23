
The *client-credentials-exchange* extensibility point allows custom code to modify the scopes and add custom claims to the tokens issued from the `POST /oauth/token` Auth0 API.

```
auth0-extension-name: "client-credentials"
```

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
