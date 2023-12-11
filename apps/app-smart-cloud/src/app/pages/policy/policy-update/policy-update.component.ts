import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import {JsonEditorOptions} from "ang-jsoneditor";

@Component({
  selector: 'one-portal-policy-update',
  templateUrl: './policy-update.component.html',
  styleUrls: ['./policy-update.component.less'],
})
export class PolicyUpdateComponent implements OnInit {

  public editorOptions: JsonEditorOptions;

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  idPolicy: number;

  isVisual: boolean = true;

  sshService: any;

  vlmService: any;

  ippService: any;

  serviceArray: any;


  panels = [
    {
      id: null,
      name: null,
      idService: null,
      listPer: null,
    },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: NzModalService,
    private notification: NzNotificationService,) {

    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.mode = 'code';
  }

  visualOption(isVisual: boolean) {
    this.isVisual = isVisual;
  }

  deleteService(panel: any) {
    this.panels = this.panels.filter(temp => temp.id != panel.id);
  }

  addService() {
    console.log(this.panels.length);
    this.panels.push({
      id: this.generateRandomString(10),
      idService: null,
      name: 'Chọn dịch vụ',
      listPer: null,
    },)
  }
  generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  changeService(panel: any) {
    console.log(panel);
    console.log(this.panels);
    let countSerice = 0;
    this.panels.forEach(pln => {
      if(pln.idService == panel.idService){
        countSerice++;
      }
    });
    if (countSerice  > 1) {
      this.notification.warning("Cảnh báo", "Dịch vụ này đã tồn tại");
      this.panels = this.panels.filter(pln => pln.id = panel.id);
      return;
    }
    switch (panel.idService) {
      case 'ssh':
        panel.name = 'SSH Key';
        panel.listPer = this.sshService;
        break;
      case 'vlm':
        panel.name = 'Volume';
        panel.listPer = this.vlmService;
        break;
      case 'ipp':
        panel.name = 'IP Public';
        panel.listPer = this.ippService;
        break;
    }
  }


  ngOnInit(): void {
    // Lấy Id Policy
    this.idPolicy = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    //Lấy danh sách Service
    this.serviceArray = [
      {
        serviceName: 'SSH Key',
        serviceId: 'ssh'
      },
      {
        serviceName: 'Volume',
        serviceId: 'vlm'
      },
      {
        serviceName: 'IP Plublic',
        serviceId: 'ipp'
      }
    ]
    // Lấy danh sách Permission Service
    this.sshService = [
      {
        permission: 'clould-server.ssh.list',
        desc: 'Lấy danh sách SSH Key',
        isActive: true,
      },
      {
        permission: 'clould-server.ssh.create',
        desc: 'Tạo SSH Key',
        isActive: false,
      },
      {
        permission: 'clould-server.ssh.delete',
        desc: 'Xóa SSH Key',
        isActive: true,
      },
    ]

    this.vlmService = [
      {
        permission: 'clould-server.vlm.list',
        desc: 'Lấy danh sách Volume',
        isActive: true,
      },
      {
        permission: 'clould-server.vlm.create',
        desc: 'Tạo Volume',
        isActive: true,
      },
      {
        permission: 'clould-server.vlm.delete',
        desc: 'Xóa Volume',
        isActive: true,
      },
      {
        permission: 'clould-server.vlm.edit',
        desc: 'Chỉnh sửa Volume',
        isActive: false,
      },
    ]

    this.ippService = [
      {
        permission: 'clould-server.ipp.list',
        desc: 'Lấy danh sách IP Public',
        isActive: true,
      },
      {
        permission: 'clould-server.ipp.create',
        desc: 'Tạo IP Public',
        isActive: true,
      },
      {
        permission: 'clould-server.ipp.delete',
        desc: 'Xóa IP Public',
        isActive: false,
      },
    ]

  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

}
