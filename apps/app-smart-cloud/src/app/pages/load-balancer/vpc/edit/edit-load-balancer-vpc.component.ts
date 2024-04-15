import { Component, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from '../../../../shared/models/project.model';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from '../../../../shared/models/region.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormSearchListBalancer, FormUpdateLB, LoadBalancerModel } from '../../../../shared/models/load-balancer.model';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { OfferDetail } from '../../../../shared/models/catalog.model';
import { ProjectService } from '../../../../shared/services/project.service';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-extend-load-balancer-vpc',
  templateUrl: './edit-load-balancer-vpc.component.html',
  styleUrls: ['./edit-load-balancer-vpc.component.less'],
})
export class EditLoadBalancerVpcComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  loadBalancerId: number;

  validateForm: FormGroup<{
    nameLoadBalancer: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameLoadBalancer: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(70),
      this.duplicateNameValidator.bind(this)]],
    description: [null as string, [Validators.maxLength(255)]]
  })
  offerDetail: OfferDetail = new OfferDetail();

  nameList: string[] = [];
  loadBalancer: LoadBalancerModel = new LoadBalancerModel();
  productId: number;
  flavorId: string;
  isLoading: boolean = false

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private activatedRoute: ActivatedRoute,
              private loadBalancerService: LoadBalancerService,
              private projectService: ProjectService,
              private catalogService: CatalogService,
              private notification: NzNotificationService) {
  }

  searchProduct() {
    this.projectService.getProjectVpc(this.project).subscribe(data => {
      this.productId = data.cloudProject.offerIdLBSDN;
      this.catalogService.getDetailOffer(this.productId).subscribe(data2 => {
        this.offerDetail = data2;
        console.log('value', this.offerDetail);
        this.flavorId = this.offerDetail?.characteristicValues[1].charOptionValues[0];
      });

    });
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
  }

  getListLoadBalancer() {
    let formSearchLB = new FormSearchListBalancer()
    formSearchLB.regionId = this.region
    formSearchLB.currentPage = 1
    formSearchLB.pageSize = 9999
    formSearchLB.vpcId = this.project
    formSearchLB.isCheckState = true
    this.loadBalancerService.search(formSearchLB).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item?.name)

        this.nameList = this.nameList?.filter(item => item !==  this.validateForm.get('nameLoadBalancer').getRawValue());
      })
    })
  }

  getLoadBalancerById() {
    this.loadBalancerService.getLoadBalancerById(this.loadBalancerId, true).subscribe(data => {
      this.loadBalancer = data

      this.validateForm.controls.nameLoadBalancer.setValue(this.loadBalancer?.name)
      this.validateForm.controls.description.setValue(this.loadBalancer?.description)
    })
  }

  submitForm() {
    if(this.validateForm.valid) {
      this.isLoading = true
      let formUpload = new FormUpdateLB()
      formUpload.id = this.loadBalancer.id
      formUpload.name = this.validateForm.controls.nameLoadBalancer.value
      formUpload.description = this.validateForm.controls.description.value
      formUpload.customerId = this.loadBalancer.customerId
      formUpload.offerId = this.loadBalancer.offerId
      this.loadBalancerService.updateLoadBalancer(formUpload).subscribe(data => {
        this.isLoading = false
        this.router.navigate(['/app-smart-cloud/load-balancer/list'])
        this.notification.success('Thành công', 'Cập nhật thông tin Load Balancer thành công')
      }, error => {
        this.isLoading = false
        this.notification.error('Thất bại', 'Cập nhật thông tin Load Balancer thất bại')
      })
    }
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.loadBalancerId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getLoadBalancerById()
    this.searchProduct();
    this.getListLoadBalancer()


  }
}
