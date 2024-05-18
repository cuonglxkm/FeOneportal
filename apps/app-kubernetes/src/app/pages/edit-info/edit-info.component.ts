import { Component, OnInit } from '@angular/core';
import { KubernetesCluster } from '../../model/cluster.model';
import { ClusterService } from '../../services/cluster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel } from 'libs/common-utils/src';
import { ProjectModel } from '../../shared/models/project.model';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.css'],
})
export class EditInfoComponent implements OnInit {

  serviceOrderCode: string;
  detailCluster: KubernetesCluster;

  editForm: FormGroup;

  isSubmitting: boolean;
  showModalCancelEdit: boolean;

  constructor(
    private clusterService: ClusterService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private notificationService: NzNotificationService
  ) {
    this.isSubmitting = false;
    this.showModalCancelEdit = false;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
      this.getDetailCluster(this.serviceOrderCode);
    });

    this.initForm();
  }

  initForm() {
    this.editForm = this.fb.group({
      serviceOrderCode: [null, [Validators.required]],
      clusterName: [null,
        [Validators.required, Validators.pattern(KubernetesConstant.CLUTERNAME_PATTERN), Validators.minLength(5), Validators.maxLength(50)]],
      description: [null, [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]]
    });
  }

  getDetailCluster(serviceOrderCode: string) {
    this.clusterService.getDetailCluster(serviceOrderCode)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.detailCluster = new KubernetesCluster(r.data);

        // fill data
        this.editForm.get('serviceOrderCode').setValue(this.serviceOrderCode);
        this.editForm.get('clusterName').setValue(this.detailCluster.clusterName);
        this.editForm.get('description').setValue(this.detailCluster.description);
      }
    });
  }

  regionId: number;
  projectId: number;
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  validateForm() {
    for (const i in this.editForm.controls) {
      this.editForm.controls[i].markAsDirty();
      this.editForm.controls[i].updateValueAndValidity();
    }
  }

  onSubbmit() {
    this.validateForm();

    if (this.editForm.valid) {
      const data = this.editForm.value;
      this.isSubmitting = true;
      this.clusterService.editClusterInfo(data)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.back2list();
        }
      })
    }
  }

  handleShowModalCancelEdit() {
    this.showModalCancelEdit = true;
  }

  handleCancelModalEdit() {
    this.showModalCancelEdit = false;
  }

  back2list() {
    this.router.navigate(['/app-kubernetes']);
  }
}
