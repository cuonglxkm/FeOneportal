export class NetworkTopologyNode {
    idLink: string;
    nameNode: string;
    parent: string;
    cloudId: string;
    name: string;
    status: string;
    image: string;
    color: string;
    children: NetworkTopologyNode[]
}

export class NetworkTopologyNodeChild {
    idLink: string;
    nameNode: string;
    parent: string;
    cloudId: string;
    name: string;
    status: string;
    image: string;
    color: string;
  }