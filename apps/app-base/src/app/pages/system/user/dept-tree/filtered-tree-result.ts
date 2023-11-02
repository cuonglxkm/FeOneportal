import { TreeNode } from "@app/core/models/interfaces/tree";

export class FilteredTreeResult {
  constructor(public treeData: TreeNode[], public needsToExpanded: TreeNode[] = []) {}
}
