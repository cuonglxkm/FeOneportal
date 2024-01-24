(function (window) {
  window['env'] = window['env'] || {};

  // Environment variables
  window['env']['baseUrl'] = '${BASE_URL}';
  window['env']['sso'] = {};
  window['env']['sso']['issuer'] = '${ISSUER}';
  window['env']['sso']['clientId'] = '${CLIENT_ID}';
  window['env']['sso']['callback'] = '${CALLBACK}';
  window['env']['sso']['logout_callback'] = '${LOGOUT_CALLBACK}';
  window['env']['sso']['scope'] = '${SCOPE}';
})(this);
