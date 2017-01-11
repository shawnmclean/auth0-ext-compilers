
The *password-exchange* extensibility point allows custom code to modify the scopes and add custom claims to the tokens issued from the `POST /oauth/token` Auth0 API using `grant_type=password`.

```
auth0-extension-name: "password-exchange"
```

#### Request body

```javascript
{
  "audience": "string",
  "scope": "array of strings",
  "user": {
    "tenant": "string"
    "id": "string",
    "displayName": "string",
    "user_metadata": "object",
    "app_metadata": "object"
  },
  "client": {
    "tenant": "string",
    "id": "string",
    "name": "string",
    "metadata": "object"
  }
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

**password-exchange**:

```javascript
/**
@param {object} user - The user that has logged in
@param {string} user.tenant - Auth0 tenant name
@param {string} user.id - user id
@param {string} user.displayName - name of user
@param {object} user.user_metadata - user metadata
@param {object} user.app_metadata - application metadata
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
module.exports = function (user, client, scope, audience, context, cb) {
  // call the callback with an error to signal authorization failure
  // or with a mapping of claims to values (including scopes).
  cb(null, { claim: 'value' }); // return error or a mapping of access token claims
};
```
