import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { InstancesService } from '../instances.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
class Network {
  name?: string = 'pri_network';
  mac?: string = '';
  ip?: string = '';
  status?: string = '';
}

@Component({
  selector: 'one-portal-network-detail',
  templateUrl: './network-detail.component.html',
  styleUrls: [],
})
export class NetworkDetailComponent implements OnInit, OnChanges {
  selectedProject: any;
  @Input() instancesId: any;
  @Input() listOfDataNetwork: any;
  @Output() valueChanged = new EventEmitter();

  constructor(
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private router: ActivatedRoute,
    public message: NzMessageService,
    private renderer: Renderer2
  ) {}

  projectChange(project: any) {
    this.valueChanged.emit(project);
  }

  ngOnInit(): void {
    this.loadList();
  }

  loadList() {
    // this.dataService.get(this.regionId).subscribe(data => {
    //   console.log(data);
    //   this.listProject = data;
    // }, error => {
    //   this.listProject = [];
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.regionId) {
      this.loadList();
    }
  }
  navigateToCreate() {
    this.route.navigate(['/app-smart-cloud/vm/instances-create']);
  }
  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/vm/instances-edit-info/' + this.instancesId,
    ]);
  }
  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/vm/instances-edit/' + this.instancesId,
    ]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/vm']);
  }
}
