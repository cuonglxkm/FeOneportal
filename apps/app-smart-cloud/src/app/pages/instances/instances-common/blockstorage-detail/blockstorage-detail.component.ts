import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../../instances.service';
class BlockStorage {
  id: number = 0;
  type?: string = '';
  name?: string = '';
  vCPU?: string = '';
  ram?: string = '';
  capacity?: string = '';
  status?: string = '';
  typeVolume?: string = '';
  price?: string = '000';
}
@Component({
  selector: 'one-portal-blockstorage-detail',
  templateUrl: './blockstorage-detail.component.html',
  styleUrls: [],
})
export class BlockstorageDetailComponent implements OnInit, OnChanges {
  selectedProject: any;
  @Input() instancesId: any;
  @Input() listOfDataBlockStorage: any;
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
    this.route.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.instancesId,
    ]);
  }
  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.instancesId,
    ]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }
}

