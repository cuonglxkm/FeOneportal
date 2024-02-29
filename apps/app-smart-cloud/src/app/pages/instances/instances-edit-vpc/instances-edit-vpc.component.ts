import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  InstancesModel,
  Network,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { G2TimelineData } from '@delon/chart/timeline';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { RegionModel } from 'src/app/shared/models/region.model';

@Component({
  selector: 'one-portal-instances-create-vpc',
  templateUrl: './instances-edit-vpc.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditVpcComponent implements OnInit {
  loading = true;

  instancesModel: InstancesModel;
  id: number;
  cloudId: string;
  regionId: number;
  projectId: number;
  listSecurityGroupModel: SecurityGroupModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    public message: NzMessageService,
  ) {}

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = `0${date.getUTCMonth() + 1}`.slice(-2);
    const day = `0${date.getUTCDate()}`.slice(-2);
    const hours = `0${date.getUTCHours()}`.slice(-2);
    const minutes = `0${date.getUTCMinutes()}`.slice(-2);
    const seconds = `0${date.getUTCSeconds()}`.slice(-2);
    const milliseconds = `00${date.getUTCMilliseconds()}`.slice(-3);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  }

  ngOnInit(): void {
    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, true).subscribe((data: any) => {
          this.instancesModel = data;
          this.loading = false;
          this.cloudId = this.instancesModel.cloudId;
          this.regionId = this.instancesModel.regionId;
          this.getListIpPublic();
          this.getAllSecurityGroup()
          this.dataService
            .getAllSecurityGroupByInstance(
              this.cloudId,
              this.regionId,
              this.instancesModel.customerId,
              this.instancesModel.projectId
            )
            .subscribe((datasg: any) => {
              this.listSecurityGroupModel = datasg;
              this.cdr.detectChanges();
            });
          this.cdr.detectChanges();
        });
      }
    });
  }

  listIPPublicStr = '';
  listIPLanStr = '';
  getListIpPublic() {
    this.dataService
      .getPortByInstance(this.id, this.regionId)
      .subscribe((dataNetwork: any) => {
        //list IP public
        let listOfPublicNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == true
        );
        let listIPPublic: string[] = [];
        listOfPublicNetwork.forEach((e) => {
          listIPPublic = listIPPublic.concat(e.fixedIPs);
        });
        this.listIPPublicStr = listIPPublic.join(', ');

        //list IP Lan
        let listOfPrivateNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == false
        );
        let listIPLan: string[] = [];
        listOfPrivateNetwork.forEach((e) => {
          listIPLan = listIPLan.concat(e.fixedIPs);
        });
        this.listIPLanStr = listIPLan.join(', ');
        this.cdr.detectChanges();
      });
  }

  onRegionChange(region: RegionModel) {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  userChangeProject() {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }

  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }

  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }


  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(
        this.regionId,
        this.tokenService.get()?.userId,
        this.projectId
      )
      .subscribe((data: any) => {
        this.listSecurityGroup = data;
        this.cdr.detectChanges();
      });
  }
}
