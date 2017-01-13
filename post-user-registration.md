
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
    "id": "string",
    "tenant": "string",
    "username": "string",
    "email": "string",
    "emailVerified": "boolean",
    "phoneNumber": "string",
    "phoneNumberVerified": "boolean"
    "user_metadata": "object",
    "app_metadata": "object"
  },
  "context": {
    "requestLanguage": "string",
    "connection": { 
      "id": "string",
      "name": "string",
      "tenant": "string"
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
@param {string} context - Auth0 connection and other context info (see protocol)
@param {function} cb - function (error, response)
*/
module.exports = function (user, context, cb) {
  // Send message to Slack etc.
  cb(null, { slack_notified: true });
};
```
