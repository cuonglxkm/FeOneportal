import { Pipe, PipeTransform } from '@angular/core';
import { PolicyService } from '../../../../../../libs/common-utils/src/lib/services/policy.service';

@Pipe({
  name: 'IsPermissionPipe'
})
export class IsPermissionPipe implements PipeTransform {

    constructor(private policyService: PolicyService) {}

    transform(action: string): boolean {
        return this.policyService.hasPermission(action);
    }
}
