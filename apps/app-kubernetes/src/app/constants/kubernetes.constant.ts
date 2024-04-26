export class KubernetesConstant {

  public static K8S_TYPE_ID = 19;

  public static DEFAULT_CIDR = "11.42.0.0";

  public static DEFAULT_SERVICE_CIDR = "11.43.0.0";

  public static CLUSTER_CREATE_TYPE = 'k8s_create';

  public static DEFAULT_VOLUME_TYPE = "ceph_ssd";

  public static DEFAULT_NETWORK_TYPE = "calico";

  public static DEFAULT_WORKER_NAME = "default";

  public static OPENSTACK_LABEL = "openstack";

  public static INPROGRESS_STATUS = [1,6,7];

  public static CIDR_CHECK = "100.64.0.0/16";

  public static LOCK_RULE = "any";

  // instance status
  public static ACTIVE_INSTANCE = 'active';

  public static STOPPED_INSTANCE = 'stopped';

  public static REBOOT_INSTANCE = 'reboot';

  // action type
  public static CREATE_ACTION = "create";

  public static DELETE_ACTION = "delete";

  public static UPGRADE_ACTION = "upgrade";

  // pattern
  public static CIDR_PATTERN = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)([/][0-3][0-2]?|[/][1-2][0-9]|[/][0-9])?$';

  public static IPV4_PATTERN = '^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$';

  public static CLUTERNAME_PATTERN = '^[a-zA-Z0-9_-]*$';

  public static WORKERNAME_PATTERN = '^[a-z0-9-_]*$';

}
