import { Pipe, PipeTransform } from '@angular/core';
import { KubernetesConstant } from '../constants/kubernetes.constant';
import SecurityGroupRule from '../model/security-group.model';

@Pipe({
  name: 'canDelRule'
})
export class CanDelRulePipe implements PipeTransform {

  transform(rule: SecurityGroupRule): boolean {
    const direction = rule.direction;
    const portRange = rule.portRange?.toLowerCase();
    const protocol = rule.protocol?.toLowerCase();
    const remoteGroupId = rule.remoteGroupId;
    const securityGroupId = rule.securityGroupId;
    const ipVersion = rule.etherType;
    const LOCK_RULE = KubernetesConstant.LOCK_RULE;
    const IPv4 = KubernetesConstant.IPv4;

    switch(direction) {
      case 'ingress':
        if (portRange == LOCK_RULE && protocol == LOCK_RULE
            && remoteGroupId == securityGroupId && ipVersion == IPv4) {
          return false;
        }
        return true;

      case 'egress':
        if (portRange == LOCK_RULE && protocol == LOCK_RULE
            && remoteGroupId == null && ipVersion == IPv4) {
          return false;
        }
        return true;

      default:
        return false;
    }
  }

}
