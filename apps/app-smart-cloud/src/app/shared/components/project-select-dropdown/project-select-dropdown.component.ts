import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectService } from '../../services/project.service';
import { RegionService } from '../../services/region.service';
import { PolicyService } from '../../services/policy.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'project-select-dropdown',
  templateUrl: './project-select-dropdown.component.html',
  styleUrls: ['./project-select-dropdown.component.less'],
})
export class ProjectSelectDropdownComponent implements OnInit, OnChanges {
  @Input() isDetail = false;
  @Input() disabledProject = false;
  @Input() isFirstVisit = true;
  @Input() regionId: number;
  @Output() valueChanged = new EventEmitter();
  @Output() userChanged = new EventEmitter();

  selectedProject: ProjectModel;
  listProject: ProjectModel[] = [];

  constructor(
    private projectService: ProjectService, 
    private regionService: RegionService, 
    private policyService: PolicyService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {}

  projectChange(project: ProjectModel) {
    localStorage.setItem('projectId', project.id + '');
    this.valueProjectChange(this.userChanged, project);
  }

  ngOnInit(): void {
    if (localStorage.getItem('regionId') != null) {
      this.regionId = JSON.parse(localStorage.getItem('regionId'));
    }
  }

  loadProjects(reload: boolean, regionId = 0) {
    if (regionId) {
      this.regionId = regionId;
    }
    if (this.regionId == null) return;
    if (localStorage.getItem('projects') && !reload) {
      this.listProject = JSON.parse(localStorage.getItem('projects'));
      if (this.listProject.length > 0) {
        if (localStorage.getItem('projectId') != null) {
          this.selectedProject = this.listProject.find(
            (item) => item.id == JSON.parse(localStorage.getItem('projectId'))
          );
          if (this.selectedProject == null) {
            this.selectedProject = this.listProject[0];
            localStorage.setItem('projectId', this.selectedProject.id + '');
          }
          this.valueProjectChange(this.valueChanged, this.selectedProject);
        } else {
          this.selectedProject = this.listProject[0];
          localStorage.setItem('projectId', this.selectedProject.id + '');
          this.valueProjectChange(this.valueChanged, this.selectedProject);
        }
      }
    } else {
      this.projectService.getByRegion(this.regionId).subscribe(
        (data) => {
          console.log(data);
          this.listProject = data;

          if (this.listProject.length > 0) {
            localStorage.setItem('projects', JSON.stringify(this.listProject));
            if (localStorage.getItem('projectId') != null) {
              this.selectedProject = this.listProject.find(
                (item) =>
                  item.id == JSON.parse(localStorage.getItem('projectId'))
              );
              if (this.selectedProject == null) {
                this.selectedProject = this.listProject[0];
                localStorage.setItem('projectId', this.selectedProject.id + '');
              }
              this.valueProjectChange(this.valueChanged, this.selectedProject);
            } else {
              this.selectedProject = this.listProject[0];
              localStorage.setItem('projectId', this.selectedProject.id + '');
              this.valueProjectChange(this.valueChanged, this.selectedProject);
            }
          } else {
            this.listProject = [];
            this.selectedProject = null;
            this.valueProjectChange(this.valueChanged, null);
            localStorage.removeItem("projects");
            localStorage.removeItem("projectId");
          }
        },
        (error) => {
          this.listProject = [];
          this.selectedProject = null;
          this.valueProjectChange(this.valueChanged, null);
          localStorage.removeItem("projects");
          localStorage.removeItem("projectId");
        }
      );
    }
  }

  valueProjectChange(valueChanged = new EventEmitter(), projectData: any){
    var isAdmin = !(localStorage?.getItem('UserRootId')) || 
      (localStorage?.getItem('UserRootId') && Number(localStorage?.getItem('UserRootId')) > 0 
      && this.tokenService?.get()?.userId && Number(localStorage?.getItem('UserRootId')) == Number(this.tokenService?.get()?.userId));
    if(isAdmin) {
      localStorage.setItem('PermissionOPA', JSON.stringify({"IsAdmin":true,"ProjectId": projectData.id}));
    }
    if(isAdmin || 
      (localStorage?.getItem('PermissionOPA') && 
      JSON.parse(localStorage.getItem('PermissionOPA') || '{}').ProjectId && 
      Number(JSON.parse(localStorage.getItem('PermissionOPA') || '{}').ProjectId) == Number(JSON.parse(localStorage?.getItem('projectId') || '0').ProjectId)
    )){
      valueChanged.emit(projectData);
    }
    else {
      this.policyService
      .getUserPermissions()
      .pipe()
      .subscribe((permission) => {
        localStorage.setItem('PermissionOPA', JSON.stringify(permission));
        valueChanged.emit(projectData);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabledProject && !this.isFirstVisit) {
      return;
    }
    if (changes.regionId) {
      if (this.regionService.isInit) {
        if (this.regionService.previousRegionId !== undefined && changes.regionId.currentValue === this.regionService.previousRegionId) {
          this.loadProjects(false);
        } else {
          this.loadProjects(true);
        }
      } else {
        this.loadProjects(true);
        this.regionService.isInit = true;
      }

      this.regionService.previousRegionId = changes.regionId.currentValue;
    }
  }
}
