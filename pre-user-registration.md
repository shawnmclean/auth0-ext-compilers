
The *pre-user-registration* extensibility point allows custom code to prevent creation of an appliction user or to add custom `app_metadata` or `user_metadata` to a newly created user. Some scenarios include:

* Enforce custom password policy  
* Prevent signup if some conditions are met (user already exists, or user is from a social connection)  
* Conditionally setting app or user metadata on the user prior to creation
* Prevent personal email domains (a domain blacklist blacklisted)


```
auth0-extension-name: "pre-user-registration"
```

#### Request body


```javascript
{ 
  "user": { 
    "id": "string",
    "tenant": "string",
    "username": "string",
    "password": "string",
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

```javascript
{
  "user": {
    "user_metadata": "object",
    "app_metadata": "object",
    // other properties are ignored
  }
}
```

All property names of `user.user_metadata` and `user.app_metadata`, if specified, must not contain `.` character and cannot start with `$` character.

If `user_metadata` or `app_metadata` are specified in the response, they will be added to the newly created user. 

#### Programming model

**pre-user-registration**:

```javascript
/**
@param {object} user - The user being created (see protocol)
@param {string} context - Auth0 connection and other context info (see protocol)
@param {function} cb - function (error, response)
*/
module.exports = function (user, context, cb) {
  // call the callback with an error to signal failure
  // an object with optional `user.user_metadata` and `user.app_metadata` properties.
  cb(null, { 
    user: {
      user_metadata: { foo: 'bar', baz: 17 },
      app_metadata: { vip: true, brownie_points: 2 }
    }
  });
};
```
