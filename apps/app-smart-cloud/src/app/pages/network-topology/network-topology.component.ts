import { Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RouterService } from 'src/app/shared/services/router.service';
import { forEach } from 'lodash';
import { NetworkTopologyNode } from 'src/app/shared/models/network-topology,model';
import { Subject } from 'rxjs';
import { Network, DataSet, Data, Edge, Options } from 'vis';

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
  private el: ElementRef,
  private renderer: Renderer2,
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
          nodes.push({
            id: item.idLink,
            label: item.name,
            shape: "image",
			      size: 26,
            image: `assets/imgs/${item.image}.png`,
            status: "ACTIVE",
            parent: item.parent
          });
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
        let treeContainer = this.treeContainer;
        let nodeDatas = this.nodes;
        let network = this.network;
        let renderer = this.renderer;
        this.network.on('click', function(properties) {
          console.log('works');
          treeContainer.nativeElement.querySelector(`.vis-network .card`)?.hide();
          var clickedNodes = [];
          if (properties.nodes) {
            var ids = properties.nodes;
            clickedNodes = nodeDatas.get(ids);
            if (ids !== null) {
              const node = network.getPositions([ids])[ids];
              const corner = network.canvasToDOM({
                x: node.x,
                y: node.y
              });
              var string = "<div class='card-body'>";
              nodeDatas.forEach(val => {
                if (val.parent == ids) {
                  string += "<div class='row form-group text-center' id='interface" + val.id + "'>" +
                    "<div style='width: 15%'>" + val.id + "</div>" +
                    "<div style='width: 20%'>" + val.name + "</div>" +
                    "<div style='width: 30%'>" + val.status + "</div>" +
                    "</div>";
                }
              });
              string += "</div>";
              treeContainer.nativeElement.querySelector('#topo' + ids)?.remove();
              let element = treeContainer.nativeElement.querySelector(".vis-network");
              element.innerHTML += "<div class='row form-group' id='topo" + ids + "' style='left: " + (corner.x + 15) + "px;top: " + (corner.y + 15) + "px; position: absolute !important; width: 200px; height: auto; -webkit-box-shadow: 0px 1px 6px #777;box-shadow: 0px 1px 6px #777;border-radius: 20px;color: #333;min-width: 200px;line-height: 1.2;font-size: 11px;'>" +
                "<div class='card' style='padding: 8px;background: #fff !important; left: " + (corner.x + 15) + ";top: " + (corner.y + 15) + "; position: absolute;box-shadow: 0px 1px 6px #777;z-index: 600;border-radius: 5px; color: #333; min-width: 200px;line-height: 1.2;font-size: 11px;'>" +
                "<a style='cursor: pointer; ' onclick='Remove(\"" + ids + "\")'><span style='float: right; margin: 5px;font-size: 16px;display: block; position: absolute; font-weight: bold; right: 6px; top: 0px; cursor: pointer; padding: 3px; color: #aaa;'>&#10005;</span></a>" +
                "<div class=card-body' style='padding-top: 5px;font-size: 15px;'>" +
                "<div class='text-left' style='color: #BBB;border-bottom: 1px solid #BBB; margin-bottom: 10px;'>Thông tin</div>" +
                "<div style='padding-bottom: 12px;'><span style='padding-right: 8px;'>Tên:</span> <span style='padding-right: 5px; white-space: nowrap; padding-bottom: 3px;'>" + clickedNodes[0].name + "</span></div>"
                +
                "<div style='padding-bottom: 12px;'><span style='padding-right: 8px;'>Trạng thái:</span> <span style='padding-right: 5px; white-space: nowrap;padding-bottom: 3px;'>" + clickedNodes[0].status + "</span></div>"
                + string + "</div>" + "</div>";
              // renderer.appendChild(element.parentNode, "<div class='row form-group' id='topo" + ids + "' style='left: " + (corner.x + 15) + "px;top: " + (corner.y + 15) + "px; position: absolute !important; width: 200px; height: auto; -webkit-box-shadow: 0px 1px 6px #777;box-shadow: 0px 1px 6px #777;border-radius: 20px;color: #333;min-width: 200px;line-height: 1.2;font-size: 11px;'>" +
              //   "<div class='card' style='padding: 8px;background: #fff !important; left: " + (corner.x + 15) + ";top: " + (corner.y + 15) + "; position: absolute;box-shadow: 0px 1px 6px #777;z-index: 600;border-radius: 5px; color: #333; min-width: 200px;line-height: 1.2;font-size: 11px;'>" +
              //   "<a style='cursor: pointer; ' onclick='Remove(\"" + ids + "\")'><span style='float: right; margin: 5px;font-size: 16px;display: block; position: absolute; font-weight: bold; right: 6px; top: 0px; cursor: pointer; padding: 3px; color: #aaa;'>&#10005;</span></a>" +
              //   "<div class=card-body' style='padding-top: 5px;font-size: 15px;'>" +
              //   "<div class='text-left' style='color: #BBB;border-bottom: 1px solid #BBB; margin-bottom: 10px;'>Thông tin</div>" +
              //   "<div style='padding-bottom: 12px;'><span style='padding-right: 8px;'>Tên:</span> <span style='padding-right: 5px; white-space: nowrap; padding-bottom: 3px;'>" + clickedNodes[0].name + "</span></div>"
              //   +
              //   "<div style='padding-bottom: 12px;'><span style='padding-right: 8px;'>Trạng thái:</span> <span style='padding-right: 5px; white-space: nowrap;padding-bottom: 3px;'>" + clickedNodes[0].status + "</span></div>"
              //   + string + "</div>" + "</div>");
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
}
