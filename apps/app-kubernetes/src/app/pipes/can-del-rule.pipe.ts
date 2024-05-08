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
    const LOCK_RULE = KubernetesConstant.LOCK_RULE;

    switch(direction) {
      case 'ingress':
        if (portRange == LOCK_RULE && protocol == LOCK_RULE && remoteGroupId == securityGroupId) {
          return false;
        }
        return true;

      case 'egress':
        if (portRange == LOCK_RULE && protocol == LOCK_RULE && remoteGroupId == null) {
          return false;
        }
        return true;

      default:
        return false;
    }
  }

}
