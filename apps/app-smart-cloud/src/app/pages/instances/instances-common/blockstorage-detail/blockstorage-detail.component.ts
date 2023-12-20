import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InstancesService } from '../../instances.service';
import { BlockStorageAttachments } from '../../instances.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-blockstorage-detail',
  templateUrl: './blockstorage-detail.component.html',
  styleUrls: [],
})
export class BlockstorageDetailComponent implements OnInit {
  @Input() instancesId: any;
  @Output() valueChanged = new EventEmitter();

  loading: boolean = true;
  listOfDataBlockStorage: BlockStorageAttachments[] = [];

  constructor(
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private router: ActivatedRoute,
    public message: NzMessageService
  ) {}

  projectChange(project: any) {
    this.valueChanged.emit(project);
  }

  ngOnInit(): void {
    this.getBlockStorage();
  }

  getBlockStorage() {
    this.dataService
      .getBlockStorage(this.instancesId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfDataBlockStorage = data;
        this.cdr.detectChanges();
      });
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
