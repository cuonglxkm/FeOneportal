(function (window) {
  window['env'] = window['env'] || {};

  // Environment variables
  window['env']['baseUrl'] = 'https://api-dev.onsmartcloud.com';
  window['env']['sso'] = {};
  window['env']['sso']['issuer'] = 'https://identity-dev.onsmartcloud.com';
  window['env']['sso']['clientId'] = 'frontend-client';
  window['env']['sso']['callback'] = 'http://localhost:4200/passport/callback/oneportal';
  window['env']['sso']['logout_callback'] = 'http://localhost:4200';
  window['env']['sso']['scope'] = 'openid profile email';
})(this);