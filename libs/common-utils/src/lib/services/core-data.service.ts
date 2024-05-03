import { Router } from "@angular/router";
import { ProjectService } from "./project.service";
import { RegionService } from "./region.service";
import { Inject, Injectable } from "@angular/core";
import { PolicyService } from "./policy.service";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";

@Injectable({ 
    providedIn: 'root' 
})
export class CoreDataService {
    constructor(
        private router: Router,
        private regionService: RegionService,
        private projectService: ProjectService,
        private policyService: PolicyService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
    ) {}

    userSelected: any;
    listUser: any[] = [];

    public getCoreData() {
        const userString = localStorage.getItem('user');

        if (userString == null) {
            return;
        }

        var userRootId = localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId;

        if (userRootId == undefined || userRootId == null) {
            return;
        }

        const user = JSON.parse(userString);
        this.listUser.push({
            id: user.userId,
            email: user.email,
            name: user.name
        });

        this.policyService.getShareUsers(userRootId).subscribe({next : (data) => {
            if (data) {
                this.listUser = this.listUser.concat(data.filter(x => x.id != user.userId));
                localStorage.setItem('ShareUsers', JSON.stringify(this.listUser))

                if (localStorage.getItem('UserRootId')) {
                    this.userSelected = this.listUser.find(x => x.id == Number(localStorage.getItem('UserRootId'))) ? 
                    this.listUser.find(x => x.id == Number(localStorage.getItem('UserRootId'))) : 
                    { id: user.userId, email: user.email, name: user.name };
                } else {
                    this.userSelected = this.listUser[0];
                    localStorage.setItem('UserRootId', JSON.stringify(this.userSelected.id));
                }

                this.getRegions();
            }
          }, error : (error) => {
            this.listUser = []
            console.log("get iam users error");
          }
        });
    }

    public getRegions() {
        let regionId = localStorage.getItem('regionId');

        localStorage.removeItem('regions');

        this.regionService.getAll().subscribe({
            next : (data) => {
                if (!data) {
                    this.router.navigateByUrl(`/exception/500`)
                }

                localStorage.setItem('regions', JSON.stringify(data));

                if (!regionId) {
                    localStorage.setItem('regionId', JSON.stringify(data[0].regionId));
                    this.getProjects(data[0].regionId);
                }
                else {
                    const found = data.some(el => el.regionId === Number(regionId));

                    if (!found) {
                        localStorage.setItem('regionId', JSON.stringify(data[0].regionId));
                        this.getProjects(data[0].regionId);
                    }
                    else {
                        this.getProjects(Number(regionId));
                    }
                }
            }, 
            error : (error) => {
                console.log("get regions error");
            }
        });
    }

    public getProjects(regionId: number) {
        if (regionId < 1) {
            return;
        }

        localStorage.removeItem('projects');

        this.projectService.getByRegion(regionId).subscribe({
            next: (data) => {
                if (!data) {
                    this.router.navigateByUrl(`/exception/500`)
                }

                localStorage.setItem('projects', JSON.stringify(data));

                if (data && data.length > 0) {
                    let projectId = localStorage.getItem('projectId');

                    if (projectId != null) {
                        const found = data.some(el => el.id === Number(projectId));

                        if (!found) {
                            localStorage.setItem('projectId', JSON.stringify(data[0].id));
                        }
                    }
                    else
                    {
                        localStorage.setItem('projectId', JSON.stringify(data[0].id));
                    }
                }
            }, 
            error: (error) => {
                console.log("get projects error");
            }
        });
    }
}