export interface TreeNode {
    id: number;
    departmentName: string;
    disabled?: boolean;
    children?: TreeNode[];
}

export interface FlatNode {
    expandable: boolean;
    departmentName: string;
    id: number;
    level: number;
    disabled: boolean;
}

export interface TreeNodeInterface {
    id: string | number;
    level?: number;
    expand?: boolean;
    children?: TreeNodeInterface[];
    parent?: TreeNodeInterface;

    [key: string]: any;
}
