
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
  accessToken: {
    scope: ['array', 'of', 'strings'],
    claim1: 'value1',
    claim2: 'value2'
  },
  idToken: {
    claimA: 'valueA',
    claimB: 'valueB'
  }
}
```
The result object in turn contains two (optional) properties: `accessToken` for the claims corresponding to the access_token (including the `scope` property, also optional), and `idToken` for the claims corresponding to the id_token.

Please note that property names for custom claims (like `claim1` or `claimA` in the above example) have to conform with the following:

* The name has to be properly namespaced, by using a valid URL with `http` or `https` schemes as prefix (for example `"https://example.com/someclaimname"`)
* The hostnames of the above mentioned URL has to be other than `auth0.com`, `webtask.io`, `webtask.run`, or subordinate domain names.

All other response properties are ignored. 

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
  var accessToken = {
    scope: ['array', 'of', 'strings'],
    'http://example.com/claim1': 'value1',
    'http://example.com/claim2': 'value2'
  };

  var idToken = {
    'http://example.com/claimA': 'valueA',
    'http://example.com/claimB': 'valueB'
  };

  // (call the callback with an error as first argument to signal authorization failure if needed)
  cb(null, { accessToken: accessToken, idToken: idToken });
};
```
