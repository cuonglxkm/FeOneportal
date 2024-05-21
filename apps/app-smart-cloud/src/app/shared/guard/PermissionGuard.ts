import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PolicyService } from '../services/policy.service';


@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(private policyService: PolicyService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const permissionNeeded = route.data['permission'];
    if (this.policyService.hasPermission(permissionNeeded)) {
      return true; 
    } else {
      this.router.navigate(['/exception/403']); 
      return false;
    }
  }
}
