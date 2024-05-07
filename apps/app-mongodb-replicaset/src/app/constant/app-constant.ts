export class AppConstants {


  public static WS_ENDPOINT = '/ws-endpoint';

  public static WS_BROADCAST_TOPIC = '/ws-topic/broadcast';

  // Web Socket constant
  static NOTI_SUCCESS = 1;

  public static PASS_REGEX =/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()~¥=_+}{":;'?\/>.<,`\-\|\[\]])[a-zA-Z0-9!@#$%^&*()~¥=_+}{":;'?\/>.<,`\-\|\[\]]{8,64}$/;

  public static IPV4_CIDR_PATTERN: RegExp = /^\b((25[0-5])|(2[0-4][0-9])|(1[0-9][0-9])|([1-9][0-9])|([0-9]))[.]((25[0-5])|(2[0-4][0-9])|(1[0-9][0-9])|([1-9][0-9])|([0-9]))[.]((25[0-5])|(2[0-4][0-9])|(1[0-9][0-9])|([1-9][0-9])|([0-9]))[.]((25[0-5])|(2[0-4][0-9])|(1[0-9][0-9])|([1-9][0-9])|([0-9]))(?:\/(?:[0-9]|[12]\d|3[0-2]))?\b$/;

  public static MONGODB_CREATE_TYPE = 'mongodb_create';
  public static MONGODB_UPGRADE_TYPE = 'mongodb_resize';
  public static MONGODB_EXTEND_TYPE = 'mongodb_extend';
  public static MONGODB_TYPE_ID = 21;
}
