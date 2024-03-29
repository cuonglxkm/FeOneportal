import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { camelizeKeys } from 'humps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { KafkaUpdateReq } from 'src/app/core/models/kafka-create-req.model';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { KafkaVersion } from 'src/app/core/models/kafka-version.model';
import { KafkaService } from 'src/app/services/kafka.service';

@Component({
  selector: 'one-portal-edit-kafka',
  templateUrl: './edit-kafka.component.html',
  styleUrls: ['./edit-kafka.component.css'],
})
export class EditKafkaComponent implements OnInit {

  myform: FormGroup;

  listOfKafkaVersion: KafkaVersion[] = [];
  serviceOrderCode: string;
  itemDetail: KafkaDetail;
  kafkaUpdateDto: KafkaUpdateReq = new KafkaUpdateReq();

  constructor(
    private fb: FormBuilder,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    private loadingSrv: LoadingService,
  ) {

  }

  ngOnInit(): void {

    this._activatedRoute.params.subscribe((params) => {
      this.serviceOrderCode = params.id;
      if (this.serviceOrderCode) {
        this.getDetail();
      }
    });

    this.getListVersion();
    this.initForm();
  }

  getDetail() {
    this.kafkaService.getDetail(this.serviceOrderCode)
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.itemDetail = camelizeKeys(res.data) as KafkaDetail;
            this.updateDataForm();
          } else {
            this.notification.error('Thất bại', res.msg);
          }
        }
      )
  }

  initForm() {
    this.myform = this.fb.group({
      serviceName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      version: [null],
      description: [null, [Validators.maxLength(500), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]],
    });
  }

  updateDataForm() {    
    this.myform.controls.serviceName.setValue(this.itemDetail.serviceName);
    this.myform.controls.version.setValue(this.itemDetail.version);
    this.myform.controls.description.setValue(this.itemDetail.description);
  }

  getListVersion() {
    this.kafkaService.getListVersion()
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.listOfKafkaVersion = camelizeKeys(res.data) as KafkaVersion[];
          }
        }
      )
  }

  backToList() {
    this.router.navigate(['/app-kafka']);
  }

  updateKafka() {
    this.kafkaUpdateDto.serviceOrderCode = this.itemDetail.serviceOrderCode;
    this.kafkaUpdateDto.serviceName = this.myform.get('serviceName').value;
    this.kafkaUpdateDto.version = this.myform.get('version').value;
    this.kafkaUpdateDto.description= this.myform.get('description').value;

    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.kafkaService.update(this.kafkaUpdateDto)
    .pipe(
      finalize(() => this.loadingSrv.close())
    )
    .subscribe(
      (data) => {
        if (data && data.code == 200) {
          this.notification.success('Thành công', data.msg);
          // navigate
          this.backToList();
        } else {
          this.notification.error('Thất bại', data.msg);
        }
      }
    );
  }

}