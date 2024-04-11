export class KubernetesConstant {

  public static K8S_TYPE_ID = 19;

  public static DEFAULT_CIDR = "10.42.0.0";

  public static CLUSTER_CREATE_TYPE = 'k8s_create';

  public static DEFAULT_VOLUME_TYPE = "ceph_ssd";

  public static DEFAULT_NETWORK_TYPE = "calico";

  public static OPENSTACK_LABEL = "openstack";

  // action type
  public static CREATE_ACTION = "create";

  public static DELETE_ACTION = "delete";

  public static UPGRADE_ACTION = "upgrade";

  // pattern
  public static CIDR_PATTERN = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)([/][0-3][0-2]?|[/][1-2][0-9]|[/][0-9])?$';

  public static IPV4_PATTERN = '^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$';

  public static CLUTERNAME_PATTERN = '^[a-zA-Z0-9_-]*$';

}
