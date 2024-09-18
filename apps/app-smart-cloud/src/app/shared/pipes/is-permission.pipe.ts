import { Pipe, PipeTransform } from '@angular/core';
import { PolicyService } from '../services/policy.service';

@Pipe({
  name: 'IsPermissionPipe'
})
export class IsPermissionPipe implements PipeTransform {

    constructor(private policyService: PolicyService) {}

    transform(action: string): boolean {
        debugger
        return this.policyService.hasPermission(action);
    }
}
