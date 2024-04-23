export class AppConstants {


  public static WS_ENDPOINT = '/ws-endpoint';

  public static WS_BROADCAST_TOPIC = '/ws-topic/broadcast';


  public static TOPIC_FORGOT_PASS = 'event-forgot-pass-user-kafka';


  public static BOOSTRAP_SERVER = "bootstrap.servers";

  public static SECURITY_PROTOCOL = "security.protocol";

  public static SASL_MECHANISM = "sasl.mechanism";

  public static SASL_JAAS_CONFIG = "sasl.jaas.config";

  public static EQUAL_SIGN = "=";

  // Cache constant
  static CACHE_ALL_API = 'list:api:all';
  static CACHE_ALL_GROUP = 'list:group:all';
  static CACHE_ALL_REGION = 'list:region:all';
  static CACHE_ALL_SERVICE_TYPE = 'list:service_type:all';
  static CACHE_LOGIN_METHOD = 'user:login:method';
  static CACHE_USER_DETAIL = 'user:detail';
  static CACHE_EXPIRED_AT = 'user:exppired_at';
  static CACHE_TOKEN = 'user:token';
  static CACHE_LANG = 'user:lang';
  static CACHE_REFRESH_TOKEN = 'user:refresh:token';
  static CACHE_FEATURED_APPS = 'list:featured:apps';
  static CACHE_NOTIFICATION_LIST = 'list:notifications';
  static CACHE_REQUESTS_LIST = 'list:cached-requests';
  static CACHE_REQUESTS_TTL = 600000; // in milisec, 600 000 ms = 10 minutes

  // Web Socket constant
  static NOTI_SUCCESS = 1;
  static NOTI_FAILED = 0;

  public static KAKFA_CREATE_TYPE = 'kafka_create';
  public static KAFKA_UPGRADE_TYPE = 'kafka_resize';
  public static KAFKA_EXTEND_TYPE = 'kafka_extend';

  public static LOCALE_EN = 'en-US';
  public static LOCALE_VI = 'vi-VI';
  
}
