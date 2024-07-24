import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectService } from '../../services/project.service';
import { RegionService } from '../../services/region.service';

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

  constructor(private projectService: ProjectService, private regionService: RegionService) {}

  projectChange(project: ProjectModel) {
    localStorage.setItem('projectId', project.id + '');
    this.userChanged.emit(project);
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
          this.valueChanged.emit(this.selectedProject);
        } else {
          this.selectedProject = this.listProject[0];
          this.valueChanged.emit(this.listProject[0]);
          localStorage.setItem('projectId', this.selectedProject.id + '');
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
              this.valueChanged.emit(this.selectedProject);
            } else {
              this.selectedProject = this.listProject[0];
              this.valueChanged.emit(this.listProject[0]);
              localStorage.setItem('projectId', this.selectedProject.id + '');
            }
          } else {
            this.listProject = [];
            this.selectedProject = null;
            this.valueChanged.emit(null);
            localStorage.removeItem("projects");
            localStorage.removeItem("projectId");
          }
        },
        (error) => {
          this.listProject = [];
          this.selectedProject = null;
          this.valueChanged.emit(null);
          localStorage.removeItem("projects");
          localStorage.removeItem("projectId");
        }
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabledProject && !this.isFirstVisit) {
      return;
    }
    if (changes.regionId) {
      if (this.regionService.previousRegionId !== undefined && changes.regionId.currentValue === this.regionService.previousRegionId) {
        this.loadProjects(false);
      } else {
        this.loadProjects(true);
      }
      this.regionService.previousRegionId = changes.regionId.currentValue;
    }
  }
}
