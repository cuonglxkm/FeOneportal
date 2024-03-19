export class KubernetesConstant {

  public static DEFAULT_CIDR = "10.42.0.0/16";

  public static CLUSTER_CREATE_TYPE = 'k8s_create';

  public static DEFAULT_VOLUME_TYPE = "standard";

  public static DEFAULT_NETWORK_TYPE = "calico";

  // action type
  public static CREATE_ACTION = "create";

  public static DELETE_ACTION = "delete";

  public static UPGRADE_ACTION = "upgrade";

}
