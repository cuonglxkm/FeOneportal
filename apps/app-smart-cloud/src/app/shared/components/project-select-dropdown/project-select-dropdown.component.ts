import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectService} from "../../services/project.service";
import {ProjectModel} from "../../models/project.model";

@Component({
  selector: 'project-select-dropdown',
  templateUrl: './project-select-dropdown.component.html',
  styleUrls: ['./project-select-dropdown.component.less'],
})
export class ProjectSelectDropdownComponent implements OnInit, OnChanges {

  selectedProject: ProjectModel;

  @Input() regionId: number;
  @Output() valueChanged = new EventEmitter();

  listProject: ProjectModel[] = []

  constructor(private projectService: ProjectService) {

  }


  projectChange(project: any) {
    this.valueChanged.emit(project);

  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getByRegion(this.regionId).subscribe(data => {
      console.log(data);
      this.listProject = data;
    }, error => {
      this.listProject = [];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.regionId) {
      this.loadProjects();
    }
  }
}
