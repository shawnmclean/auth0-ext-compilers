
The *send-phone-message* extensibility point allows customization of SMS providers.

```
auth0-extension-name: "send-phone-message"
```

#### Request body

```javascript
{
    "recipient": "1-808-555-5555",
    "text": "Here is your one time password!",
    "context": {
      "factor_type": "first",
      "message_type": "sms",
      "action": "enrollment",
      "language": "en",
      "code": "1234556ADSFA547865",
      "ip": "127.0.0.1",
      "user_agent": "some agent",
      "client": {
          "client_id": "1235",
          "name": "Test Application",
          "client_metadata": { ... }
      },       
      "user": {}
    }
  }
```

#### Programming model

**send-phone-message**:

```javascript
  /**
  @param {string} recipient - phone number
  @param {string} text - message body
  @param {object} context - additional authorization context
  @param {string} context.factor_type - 'first' or 'second'
  @param {string} context.message_type - 'sms' or 'voice'
  @param {string} context.action - 'enrollment' or 'authentication'
  @param {string} context.language - language used by login flow
  @param {string} context.code - one time password
  @param {string} context.ip - ip address
  @param {string} context.user_agent - 
  @param {string} context.client_id - to send different messages depending on the client id
  @param {string} context.name - to include it in the SMS message
  @param {object} context.client_metadata - metadata from client
  @param {object} context.user - To customize messages for the user
  @param {function} cb - function (error, response)
  */
  module.exports = function(recipient, text, context, cb) {
    // Configure custom SMS provider

    cb();
  };
```
