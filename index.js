'use strict';


module.exports = {
    'client-credentials-exchange': require('./lib/compilers/client_credentials_exchange'),
    'password-exchange': require('./lib/compilers/password_exchange'),
    'post-change-password': require('./lib/compilers/user-registration'),
    'pre-user-registration': require('./lib/compilers/user-registration'),
    'post-user-registration': require('./lib/compilers/user-registration'),
    'send-phone-message': require('./lib/compilers/send-phone-message'),
    'generic': require('./lib/compilers/generic'),
};
