import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Addon, Graph } from '@antv/x6';
import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-flow-chat',
  templateUrl: './flow-chat.component.html',
  styleUrls: ['./flow-chat.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowChatComponent implements OnInit, AfterViewInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Process editor, with the flow chart, I should know what to do in the future',
    breadcrumb: ['Home', 'Extensions', 'Graphic Editor', 'Flow Editor'],
    desc: 'A thousand words are not as good as a picture, and a flowchart is a good way to express the idea of an algorithm (simple flowchart example, specific functions need to be improved by yourself, antV x6)'
  };
  graph!: Graph;
  @ViewChild('container') container!: ElementRef;

  /** Some basic properties of x6 canvas */
  graphBasicConfig = {
    grid: {
      size: 10, // grid size 10px
      visible: true // render grid background
    },
    panning: true, // Canvas dragging
    selecting: true,
    height: 400,
    connecting: {
      snap: true, // Automatic snapping will be triggered when the distance from the node or connection pile is 50px during the connection process
      allowBlank: false, // Whether to allow points connected to the blank position of the canvas
      allowLoop: false, // Whether to allow the creation of loop connections, that is, the start node and end node of the edge are the same node
      allowNode: false, // Whether to allow edges to link to nodes (link stubs on non-nodes)
      allowEdge: false, // whether to allow edges to link to another edge
      connector: 'rounded',
      connectionPoint: 'boundary'
    }
  };

  constructor() {}

  ngOnInit(): void {}

  drag(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const shap = target.getAttribute('shap')!;

    const dnd = new Addon.Dnd({
      target: this.graph
    });

    const node = this.graph.createNode({
      width: 100,
      height: 100,
      shape: shap,
      ports: {
        groups: {
          // Input link pile group definition
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff'
              }
            }
          },
          // Output link pile group definition
          out: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff'
              }
            }
          }
        },
        items: [
          {
            id: 'port1',
            group: 'in'
          },
          {
            id: 'port2',
            group: 'in'
          },
          {
            id: 'port3',
            group: 'in'
          },
          {
            id: 'port4',
            group: 'out'
          },
          {
            id: 'port5',
            group: 'out'
          }
        ]
      },
      attrs: {
        body: {
          // fill: '#ccc'
        }
      }
    });
    dnd.start(node, event);
  }

  initGraph(): void {
    const graphConfig = {
      ...this.graphBasicConfig,
      container: this.container.nativeElement
    };
    this.graph = new Graph(graphConfig);
  }

  ngAfterViewInit(): void {
    this.initGraph();
  }
}
