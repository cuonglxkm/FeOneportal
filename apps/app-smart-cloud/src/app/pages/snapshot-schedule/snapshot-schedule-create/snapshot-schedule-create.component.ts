import {Component, Inject, OnInit} from "@angular/core";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Router} from "@angular/router";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VolumeService} from "../../../shared/services/volume.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {CreateScheduleSnapshotDTO} from "../../../shared/models/snapshotvl.model";

@Component({
  selector: 'one-portal-create-schedule-snapshot',
  templateUrl: './snapshot-schedule-create.component.html',
  styleUrls: ['./snapshot-schedule-create.component.less'],
})
export class SnapshotScheduleCreateComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));


  isLoading: boolean;
  scheduleName: string;
  showWarningName: boolean;
  contentShowWarningName: string;

  volumeId: number;

  volumeList: NzSelectOptionInterface[] = [];
  userId: number;
  scheduleStartTime:string;
  dateStart: string;
  descSchedule: string;

  dateList: NzSelectOptionInterface[] = [
    {label:'Chủ nhật' , value: '0'},
    {label:'Thứ hai' , value: '1'},
    {label:'Thứ ba' , value: '2'},
    {label:'Thứ tư' , value: '3'},
    {label:'Thứ năm' , value: '4'},
    {label:'Thứ sáu' , value: '5'},
    {label:'Thứ bảy' , value: '6'},
  ];


  ngOnInit(): void {
    const  now = new Date();
    this.scheduleStartTime = now.getHours().toString() + ':' + now.getUTCMinutes().toString() + ':' + now.getSeconds().toString() ;
    this.userId = this.tokenService.get()?.userId;
    this.doGetListVolume();
  }

  changeScheduleName() {

  }

  doGetListVolume() {
    this.isLoading = true;
    this.volumeList = [];
    this.volumeService.getVolumes(this.userId, this.project, this.region, null, 1000, 1, null, null).subscribe(data => {
      data.records.forEach(volume => {
        this.volumeList.push({value: volume.id , label: volume.name});
      })
      this.isLoading = false;
    }, error => {
      this.notification.error('Có lỗi xảy ra', 'Lấy danh sách Volume thất bại');
      this.isLoading = false;
    })
  }

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private snapshotService: SnapshotVolumeService,
              private volumeService: VolumeService,
              private notification: NzNotificationService) {
  }

  goBack(){
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
  }
  create(){
    this.isLoading = true
    let request = new CreateScheduleSnapshotDTO();
    request.dayOfWeek = this.dateStart;
    request.daysOfWeek = null;
    request.description = this.descSchedule;
    request.intervalWeek = 1 // fix cứng số tuần  = 1;
    request.mode = 3 //fix cứng chế độ = theo tuần ;
    request.dates = null;
    request.duration = null;
    request.name = this.scheduleName;
    request.volumeId = this.volumeId;
    request.runtime = new Date().toISOString();
    request.intervalMonth = null;
    request.maxBaxup = 1 // fix cứng số bản
    request.snapshotPacketId = null;
    request.customerId = this.userId;
    request.projectId = this.project;
    request.regionId = this.region;
    console.log(request);
    this.snapshotService.createSnapshotSchedule(request).subscribe(
      (data) =>{
        if(data != null){
          console.log(data);
          this.isLoading = false;
          this.notification.success('Success', 'Tạo lịch thành công');
          this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
        }else{
          this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
          this.isLoading = false;
        }
      },
      (error) => {
        console.log(error);
        this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
        this.isLoading = false;
      }
    )
  }

  changeName(){
    this.scheduleName = this.scheduleName.trim();
    if(this.checkSpecialSnapshotName(this.scheduleName)){
      this.showWarningName = true;
      this.contentShowWarningName = 'Tên lịch Snapshot không được chứa ký tự đặc biệt.';
    }else if(this.scheduleName === null || this.scheduleName == ''){
      this.showWarningName = true;
      this.contentShowWarningName = 'Tên lịch Snapshot không được để trống';
    }else{
      this.showWarningName = false;
      this.contentShowWarningName = '';
    }
  }

  checkSpecialSnapshotName( str: string): boolean{
    //check ký tự đặc biệt
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharacters.test(str);
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.doGetListVolume();
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.doGetListVolume();
  }
}
