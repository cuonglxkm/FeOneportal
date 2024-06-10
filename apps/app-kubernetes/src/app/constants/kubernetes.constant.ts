export class KubernetesConstant {

  public static K8S_TYPE_ID = 19;

  public static DEFAULT_CIDR = "10.10.0.0";

  public static DEFAULT_SERVICE_CIDR = "10.11.0.0";

  public static CLUSTER_CREATE_TYPE = 'k8s_create';

  public static CLUSTER_UPGRADE_TYPE = 'k8s_resize';

  public static CLUSTER_EXTEND_TYPE = 'k8s_extend';

  public static DEFAULT_VOLUME_TYPE = "idg-shoot-ssd";

  public static DEFAULT_NETWORK_TYPE = "calico";

  public static DEFAULT_WORKER_NAME = "default";

  public static OPENSTACK_LABEL = "openstack";

  public static INPROGRESS_STATUS = [1,6,7];

  public static CIDR_CHECK = "100.64.0.0/16";

  public static LOCK_RULE = "any";

  public static IPv4 = "IPv4";

  // instance
  public static ACTIVE_INSTANCE = 'active';

  public static STOPPED_INSTANCE = 'stopped';

  public static REBOOT_INSTANCE = 'reboot';

  public static START_ACTION = "START";

  public static STOP_ACTION = "STOP";

  public static REBOOT_ACTION = "REBOOT-SOFT";

  // action type
  public static CREATE_ACTION = "create";

  public static DELETE_ACTION = "delete";

  public static UPGRADE_ACTION = "upgrade";

  // pattern
  public static CIDR_PATTERN = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)([/][0-3][0-2]?|[/][1-2][0-9]|[/][0-9])?$';

  public static IPV4_PATTERN = '^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$';

  public static CLUTERNAME_PATTERN = '^[a-zA-Z0-9_-]*$';

  public static WORKERNAME_PATTERN = '^[a-z0-9-]*$';

  // sg constant
  public static INBOUND_RULE = "ingress";

  public static CREATE_INBOUND_RULE = "CREATE_INBOUND";

  public static DELETE_INBOUND_RULE = "DELETE_INBOUND";

  public static OUTBOUND_RULE = "egress";

  public static CREATE_OUTBOUND_RULE = "CREATE_OUTBOUND";

  public static DELETE_OUTBOUND_RULE = "DELETE_OUTBOUND";

  public static DEFAULT_RESOURCE = "rule";

}
