import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RouterService } from 'src/app/shared/services/router.service';
import { forEach } from 'lodash';
import { NetworkTopologyNode } from 'src/app/shared/models/network-topology,model';
import { Subject } from 'rxjs';
import { Network, DataSet, Data, Edge } from 'vis';

@Component({
  selector: 'one-portal-network-topology',
  templateUrl: './network-topology.component.html',
  styleUrls: ['./network-topology.component.less'],
})
export class NetworkTopologyComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  customerId: number;
  projectType: any;

  isLoading: boolean = false;

  isBegin: boolean = false;

  // data: NetworkTopologyNode[];

  private data: Data;

  private nodes: DataSet<Node>;

  private edges: DataSet<Edge>;

  private selectedData: Subject<Data>;

  private network: Network;

  private nodeNo: number = 0;

  @ViewChild('treeContainer', { static: true }) treeContainer: ElementRef;

  constructor(private routerService: RouterService,
  @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    this.selectedData = new Subject<Data>();
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
    this.projectType = project.type;
    console.log(this.projectType);
    this.getData(true);
  }

  getData(isCheckBegin) {
    this.isLoading = true
    
    this.routerService.networkTopology(this.region, this.project).pipe().subscribe(data => {
      this.isLoading = false;
      if(data && data.length > 0){
        this.nodeNo = data.length;
        data.forEach(item => {
          switch (item.nameNode) {
            case "VM":
                item.image = "icon-vm-40";
								break;
							case "PriNet":
								item.image = "icon-internal-40";
								break;
							case "PublicNet":
								item.image = "icon-external-40";
								break;
							case "Router":
								item.image = "icon-router-40";
								break;
          }
        });
        this.data = data.filter(x => !x.parent || x.parent == '');

        let childrenNode = data.filter(x => x.parent && x.parent != '');
        if(this.data && this.data.length > 0){
          this.data.forEach(dataItem => {
            this.findNodeChild(childrenNode, dataItem);
          });
          debugger
        }
      }
    }, error => {
        this.isLoading = false;
      })
  }

  findNodeChild(childrenNode, node){
    let children = childrenNode.filter(x => x.parent == node.idLink);
    if(children && children.length > 0){
      node.children = children;
      children.forEach(child => {
        this.findNodeChild(childrenNode, child);
      });
    }
  }
}
