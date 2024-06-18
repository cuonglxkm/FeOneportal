import { Pipe, PipeTransform } from '@angular/core';
import { RoleModel } from '../model/roles.model';

@Pipe({
  name: 'userRoles'
})
export class UserRoles implements PipeTransform {

  transform(roles: RoleModel[]): RoleModelCus[] {
    const uniqueRoles: string[] = Array.from(new Set(roles.map(roleObj => roleObj.role)));

    const transformedRoles = uniqueRoles.map(role => {

        const filteredRoles = roles.filter(roleObj => roleObj.role === role);
        
        const db = filteredRoles.map(roleObj => roleObj.db);

        return new RoleModelCus(role , db);
    });

    return transformedRoles;
  }

}

class RoleModelCus{
  role: string;
  db: string[];
  constructor(role: string, db: string[]) {
    this.role = role;
    this.db = db;
  }
}