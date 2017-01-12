
The *post-user-registration* extensibility point allows custom code to implement custom actions in response to creation of a new application user in the database. It executes asynchronously with the rest of the Auth0 pipeline and its outcome does not affect the Auth0 pipeline. Some scenarios are:

* Send notifications to Slack or e-mail about creation of a new user
* Create a record in SalesForce


```
auth0-extension-name: "post-user-registration"
```

#### Request body

```javascript
{ 
  "user": { 
    "tenant": "string",
    "client_id": "string",
    "connection": "string",
    "email": "string",
    "password": "string",
    "request_language": "string"
  },
  "context": {
    "connection": { 
      "name": "string",
       "tenant": "string",
       "strategy": "string",
       "status": "boolean",
       "connection_id": "string"
    },
    "client": { 
      "tenant": "string", 
      "id": "string"
    }
  }
}
```

#### Response body

Any valid JSON object. The response is logged in Auth0 but does not affect processing.

#### Programming model

**post-user-registration**:

```javascript
/**
@param {object} user - The user being created (see protocol)
@param {string} context.connection - Auth0 connection (see protocol)
@param {string} context.client - Auth0 client (see protocol)
@param {function} cb - function (error, response)
*/
module.exports = function (user, context, cb) {
  // Send message to Slack etc.
  cb(null, { slack_notified: true });
};
```
