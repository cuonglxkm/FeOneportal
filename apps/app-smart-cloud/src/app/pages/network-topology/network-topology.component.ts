import { Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RouterService } from 'src/app/shared/services/router.service';
import { forEach } from 'lodash';
import { NetworkTopologyNode } from 'src/app/shared/models/network-topology,model';
import { Subject } from 'rxjs';
import { Network, DataSet, Data, Edge, Options } from 'vis';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

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

  noteForcus: any;

  @ViewChild('treeContainer', { static: false }) treeContainer: ElementRef;
  @ViewChild('formContainer', { static: false }) formContainer: ElementRef;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private routerService: RouterService,
  private el: ElementRef,
  private renderer: Renderer2,
  @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    this.selectedData = new Subject<Data>();
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
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
        var nodes = [];
        data.forEach((item, index) => {
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
          if(!nodes.find(x => x.id == item.idLink)){
            nodes.push({
              id: item.idLink,
              label: item.name ? item.name : "",
              shape: "image",
              size: 26,
              image: `assets/imgs/${item.image}.png`,
              status: "ACTIVE",
              parent: item.parent,
              name: item.name ? item.name : ""
            });
          }
        });
        this.nodes = new DataSet(nodes);
        let edges = []
        data.forEach(item => {
          if(item.parent && data.find(x => x.idLink == item.parent)){
            edges.push({
              from: item.idLink,
              to: data.find(x => x.idLink == item.parent).idLink,
            });
          }
        });
        this.edges = new DataSet(edges);
        this.data = {
          nodes: this.nodes,
          edges: this.edges,
        };
        this.network = new Network(
          this.treeContainer.nativeElement,
          this.data,
          this.getNetworkOptions()
        );
        const me = this;
        this.network.on('click', function(properties) {
          console.log('works');
          me.treeContainer.nativeElement.querySelector(`.vis-network .card`)?.hide();
          var clickedNodes = [];
          if (properties.nodes) {
            var ids = properties.nodes;
            clickedNodes = me.nodes.get(ids);
            if (ids !== null && ids.length > 0) {
              const node = me.network.getPositions([ids])[ids];
              const corner = me.network.canvasToDOM({
                x: node.x,
                y: node.y
              });
              var string = "<div class='card-body'>";
              me.nodes.forEach(val => {
                if (val.parent == ids) {
                  string += "<div class='row form-group text-center' id='interface" + val.id + "'>" +
                    "<div style='width: 15%'>" + val.id + "</div>" +
                    "<div style='width: 20%'>" + val.name + "</div>" +
                    "<div style='width: 30%'>" + val.status + "</div>" +
                    "</div>";
                }
              });
              string += "</div>";
              me.treeContainer.nativeElement.querySelector('#topo' + ids)?.remove();
              let element = me.treeContainer.nativeElement.querySelector(".vis-network");
              me.noteForcus = clickedNodes[0];
              let popupInfo = me.formContainer.nativeElement.querySelector(".infomation-popup");
              me.renderer.removeClass(popupInfo, 'hide-element');
              me.renderer.setStyle(popupInfo, 'left', `${corner.x + 15}px`);
              me.renderer.setStyle(popupInfo, 'top', `${corner.y + 15}px`);
              me.renderer.setStyle(element, 'pointer-events', `none`);

              me.renderer.setAttribute(popupInfo, 'id', `topo${me.noteForcus.id}`);
              me.formContainer.nativeElement.querySelector("#node-name-popup").innerHTML = me.noteForcus.name;
              me.formContainer.nativeElement.querySelector("#node-status-popup").innerHTML = me.noteForcus.status;
            }
      
          }
        });
      }
    }, error => {
        this.isLoading = false;
      })
  }

  public getNetworkOptions(): Options {
    return {
      autoResize: true,
      height: "600px",
      width: "100%",
      physics: { enabled: true },
      layout: {
        randomSeed: 5,
        improvedLayout: true,
        hierarchical: {
          enabled: true,
          levelSeparation: 170,
          direction: "UD", // UD, DU, LR, RL
          sortMethod: "directed", // hubsize, directed
          nodeSpacing: 100
        }
      },
      nodes: {
        scaling: {
          min: 150,
          max: 160,
          label: {
            enabled: false,
            min: 14,
            max: 30,
            maxVisible: 40,
            drawThreshold: 5
          },
          customScalingFunction: (
            min: number,
            max: number,
            total: number,
            value: number
          ) => {
            if (max === min) {
              return 0.5;
            } else {
              let scale = 1 / (max - min);
              return Math.max(0, (value - min) * scale);
            }
          }
        },
        size: 40,
        //color: "#F06292",
        color: "#fff",

        font: {
          size: 20,
          color: "#2b2d3b"
        }
      }
    };
  }

  public RemovePopup() {
    if(this.noteForcus && this.noteForcus.id){
      let popupInfo = this.formContainer.nativeElement.querySelector(".infomation-popup");
      this.renderer.addClass(popupInfo, 'hide-element');
      this.renderer.removeStyle(this.treeContainer.nativeElement.querySelector(".vis-network"), 'pointer-events');
    }
    // this.formContainer.nativeElement.querySelector('#topo' + this.noteForcus.id).remove();
  }
}
