export const IP_ADDRESS_REGEX = /^(\d{1,3}\.){3}\d{1,3}\/(16|24)$/;
export const NEXTHOP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
export const TAX_CODE_REGEX = /^[0-9-]+$/;
export const NAME_SNAPSHOT_REGEX = /^(?! *$)[a-zA-Z0-9-_ ]{1,255}$/;
export const NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,49}$/;
export const NAME_SPECIAL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,49}$/;
export const PEER_VPN_REGEX =/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const CIDR_REGEX = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}0\\/24(,\\s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}0\\/24)*$';