import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MongodbInfor } from '../../../model/mongodb-infor.model';
import { MongoService } from '../../../service/mongo.service';
import { AppDetail, MongodbDetail } from '../../../model/mongodb-detail.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NotificationService } from 'libs/common-utils/src';
import { UtilService } from '../../../service/utils.service';
import { NotiStatusEnum } from '../../../enum/noti-status.enum';


@Component({
  selector: 'one-portal-edit-mongodbrep',
  templateUrl: './edit-mongodbrep.component.html',
  styleUrls: ['./edit-mongodbrep.component.css'],
})
export class EditMongodbrepComponent implements OnInit, OnDestroy {
  regionId: number;
  projectId: number;

  myform: FormGroup;
  
  serviceCode: string;
  mongoDetail: MongodbDetail;
  listOfVersion: string[] = [];

  isChangeForm = false;
  isVisible = false;
  isOkLoading = false;

  constructor(private mongoService: MongoService,
    private _activatedRoute: ActivatedRoute,
    private router:Router,
    private fb:FormBuilder,
    private loadingSrv:LoadingService,
    private utilService: UtilService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {

  }

  ngOnInit(): void {
    this.myform = this.fb.group({
      serviceName: [{value:'',disabled:true}],
      version: [null, [Validators.required]],
      description: [null]
    })
    
    this._activatedRoute.params.subscribe((params) => {
      this.serviceCode = params.id;
      if (this.serviceCode) {
        this.getDetail();
      }
    });
  }

  
  ngOnDestroy(): void {
    console.log();
  }

  getListOfVersion() {
    this.mongoService.getAllVersion(this.mongoDetail.version).subscribe((data: any) => {
      this.listOfVersion = data.data;
    });
  }


  submitForm(){
    this.isVisible = true;
  }


  closeForm(){
    this.router.navigate(['/app-mongodb-replicaset']);
  }

  getDetail() {
    this.mongoService.getDetail(this.serviceCode).subscribe(result => {
      this.mongoDetail = result.data
      this.myform.controls.serviceName.setValue(this.mongoDetail.service_name)
      this.myform.controls.version.setValue(this.mongoDetail.version)
      this.getListOfVersion();
    });
  }

  handleCancel(){
    this.isVisible = false;
  }

  handleOk(){
    this.isVisible = false;
    this.loadingSrv.open({type:'spin',text:'Loading...'})
    const mongodbChoosen : MongodbUpgradeVersion = {
      service_code: this.serviceCode,
      version : this.myform.controls.version.value,
      description: this.myform.controls.description.value
    }
    this.mongoService.upgradeVersion(mongodbChoosen).subscribe(
      (r : any) => {
        if(r.code == 200) {
          this.utilService.showNotification(NotiStatusEnum.SUCCESS,r.message,"Thông báo");
          this.router.navigate(['/app-mongodb-replicaset']);
        } else
          this.utilService.showNotification(NotiStatusEnum.ERROR,r.message,"Thông báo");
        this.loadingSrv.close()
      }
    )
  }
}

interface MongodbUpgradeVersion {
  service_code: string; 
  version: string;
  description: string;
}
