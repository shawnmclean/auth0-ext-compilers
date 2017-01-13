'use strict';


module.exports = {
    'client-credentials-exchange': require('./lib/compilers/client_credentials_exchange'),
    'password-exchange': require('./lib/compilers/password_exchange'),
    'pre-user-registration': require('./lib/compilers/user-registration'),
    'post-user-registration': require('./lib/compilers/user-registration'),
    'generic': require('./lib/compilers/generic'),
};
