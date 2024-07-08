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

@Component({
  selector: 'project-select-dropdown',
  templateUrl: './project-select-dropdown.component.html',
  styleUrls: ['./project-select-dropdown.component.less'],
})
export class ProjectSelectDropdownComponent implements OnInit, OnChanges {
  selectedProject: ProjectModel;
  @Input() isDetail = false;
  @Input() disabledProject = false;
  @Input() isFirstVisit = true;
  @Input() regionId: number;
  @Output() valueChanged = new EventEmitter();
  @Output() userChanged = new EventEmitter();

  listProject: ProjectModel[] = [];

  constructor(private projectService: ProjectService) {}

  projectChange(project: ProjectModel) {
    localStorage.setItem('projectId', project.id + '');
    this.userChanged.emit(project);
  }

  ngOnInit(): void {
    if (localStorage.getItem('regionId') != null) {
      this.regionId = JSON.parse(localStorage.getItem('regionId'));
      // this.valueChanged.emit(this.selectedRegion)
    }
    // this.loadProjects(false);
  }

  loadProjects(reload: boolean) {
    if (this.regionId == null) return;
    if (localStorage.getItem('projects') && reload == false) {
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
            localStorage.removeItem('projectId');
          }
        },
        (error) => {
          this.listProject = [];
          this.selectedProject = null;
          this.valueChanged.emit(null);
          localStorage.removeItem('projectId');
        }
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabledProject && !this.isFirstVisit) {
      return;
    }
    if (changes.regionId) {
      this.loadProjects(true);
    } else {
      this.selectedProject = null;
      this.loadProjects(true);
    }
  }
}
