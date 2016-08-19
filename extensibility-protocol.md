# Extensibility model

## Goals

* Simple and clean interface for `auth0-server`
* Simple and clean interface for `webtask`
* Users never exposed to underlying complexity
* Design accounts for potential migration to webtask-side pipelining of rules

## Example transaction

`auth0-server` has received a request that should trigger any existing `client-credentials-exchange` rules.

**1. Invoke extensions**

```js
return executeExtension2.run_extension({
    tenant: client.tenant,
    extension_name: 'client-credentials-exchange',
    logger: winston,
    payload: extension_payload,
}, function (error, accessTokenClaims) {
    // ...
});
```

**2. `executeExtension2` does:**

1. For a cache miss, request the full list of extension webtasks from the webtask cluster
2. Cache this list in a time-limited LRU
3. Filter this list to webtasks relevant to the extensibility point being invoked
4. Sort this list using a known metadata property
5. Invoke each webtask in the resulting list in a _waterfall_ fashion where the following holds:

The waterfall is designed as a sort of remote `reduce` function. To do so, it sends the initial payload passed in by `auth0-server` to the first webtask. The payload is:

```js
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

**3. A webtask request is received**

The webtask cluster, having received a webtask request:

1. Assigns a webtask container instance to the container name of the request (tenant name) if none are currently assigned
2. Reads the webtask's metadata to see if any compilers should be used
3. Identifies `auth0-ext-compilers/client-credentials-exchange` and invokes that compiler function on the webtask's code.

    The webtask's code looks like this:
    ```js
    module.exports = function(client, scope, audience, cb) {
        // Tenant logic...

        cb(null, { geoff: 'rules' });
    };
    ```
4. The webtask compiler first 'compiles' the code (`String` -> `Function`).
    1. The webtask compiler now holds the reference to the tenant's webtask _Function_.
    2. The webtask compiler returns a function that wraps around the tenant's webtask function and adapts between the webtask programming model and the extensibility points's programming model. It also has logic to respond with errors in a way that respects http semantics. **That function also has special logic to transform the webtask's response data into a payload that is acceptable for either the next webtask or for `executeExtension2`'s final consumption.**
5.  The webtask function is executed and the compiler transforms the response into:

    ```js
    {
      "audience": "string",
      "client": {
        "name": "string",
        "id": "string",
        "metadata": "object",
        "tenant": "string"
      },
      "scope": "array of strings",
      "client-credentials-exchange": {
          "geoff": "rules"
      }
    }
    ```

    Note that the accumulation happens in a property corresponding to the name of the extensibility point being run. _This means compilers are coupled to specific extensibility points._
6. The response is sent back to `auth0-server`.

**4. `executeExtension2` receives the response from the first webtask**

The response is sent as the request payload back to the webtask cluster for the second webtask registered for this extensibility point. Note that it now has the additional accumulator property `client-credentials-exchange`. All the same logic as before is invoked. The following shows the relevant differences with the first rule's invocation.

1. The second rule is invoked. It's code is:

    ```js
    module.exports = function(client, scope, audience, cb) {
        // Tenant logic...

        cb(null, { auth0: 'too' });
    };
    ```

2. The `client-credentials-exchange` compiler is now responsible for reducing  that output `{ auth0: 'too' }` to produce a response payload suitable for consumption by a further rule or by `executeExtension2`.
3. The compiler accumulates the new data and generates a response payload of:

    ```js
    {
      "audience": "string",
      "client": {
        "name": "string",
        "id": "string",
        "metadata": "object",
        "tenant": "string"
      },
      "scope": "array of strings",
      "client-credentials-exchange": {
          "geoff": "rules",
          "auth0": "too"
      }
    }
    ```

**5. `executeExtensions2` receives the response from the final extensibility point rule**

Now that `executeExtensions2` has run all of the webtasks identified for the given extensibility point, it must fire the callback passed to it by `auth0-server`. If any error occurred, the callback will be fired as `cb(error)`. Otherwise, the callback will be fired *with the contents of the accumulator property in the last response payload*.

In our current example, we are running `client-credentials-exchange` so `executeExtensions2` will extract the data contained in that property of the last response from the webtask server and fire the callback with it:

```js
const result = response.data[currentExtensibilityPoint];

cb(null, result);
```

**6. Control returns to `auth0-server`**

The callback that `auth0-server` passed into `executeExtensions2` has been called back with arguments of

1. `null`
2. `{ geoff: 'rules', auth0: 'too' }`

HAPPY, HAPPY.