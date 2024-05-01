import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PolicyService } from '../../../../../../libs/common-utils/src/lib/services/policy.service';


@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(private policyService: PolicyService, private router: Router) {}

  canActivate(): boolean {
    if (this.policyService.hasPermission("order:Create")) {
      return true; 
    } else {
      this.router.navigate(['/exception/403']); 
      return false;
    }
  }
}
