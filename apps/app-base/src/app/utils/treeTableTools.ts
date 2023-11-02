import { TreeNodeInterface } from '@app/core/models/interfaces/tree';

function convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
  const stack: TreeNodeInterface[] = [];
  const array: TreeNodeInterface[] = [];
  const hashMap = {};
  stack.push({ ...root, level: 0, expand: false, _checked: false });

  while (stack.length !== 0) {
    const node = stack.pop()!;
    visitNode(node, hashMap, array);
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({ ...node.children[i], level: node.level! + 1, _checked: false, expand: false, parent: node });
      }
    }
  }

  return array;
}

function visitNode(node: TreeNodeInterface, hashMap: { [key: string]: boolean }, array: TreeNodeInterface[]): void {
  if (!hashMap[node.id]) {
    hashMap[node.id] = true;
    array.push(node);
  }
}

// Get the treeData in the form of map, and the input parameter is dataList
const fnTreeDataToMap = function tableToTreeData(dataList: any[]): { [key: string]: TreeNodeInterface[] } {
  const mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  dataList.forEach(item => {
    mapOfExpandedData[item.id] = convertTreeToList(item);
  });
  return mapOfExpandedData;
};

/**
  * This method is used to convert the array with parent-child relationship into an array of tree structure
  * Receive an array with parent-child relationship as a parameter
  * Returns an array of tree structures
  */
const fnFlatDataHasParentToTree = function translateDataToTree(data: any[], fatherId = 'fatherId'): any {
  // We believe that the data with fatherId=0 is the first-level data
  // data without parent node
  let parents = data.filter(value => value[fatherId] === "0");

  // data of the parent node
  let children = data.filter(value => value[fatherId] !== "0");

  // Define the concrete implementation of the conversion method
  let translator = (parents: any[], children: any[]): any => {
    //traverse parent node data
    parents.forEach(parent => {
      //traverse child node data
      children.forEach((current, index) => {
        //Find a child node corresponding to the parent node at this time
        if (current[fatherId] === parent.id) {
          //Deep copy the child node data. Only some types of data deep copy are supported here. Children's boots who don't know about deep copy can learn about deep copy first.
          let temp = JSON.parse(JSON.stringify(children));
          //Remove the current child node from temp, and temp is used as the new child node data. This is to make the number of traversal of the child node less during recursion. If the parent-child relationship has more levels, it is more beneficial
          temp.splice(index, 1);
          //Let the current child node be the only parent node to recursively find its corresponding child node
          translator([current], temp);
          // Put the found child node into the children attribute of the parent node
          typeof parent.children !== 'undefined' ? parent.children.push(current) : (parent.children = [current]);
        }
      });
    });
  };
  // call conversion method
  translator(parents, children);
  return parents;
};

// Add a hierarchy to the tree structure data and mark whether it is the root node, the root node isLeaf is true, and the level is represented by level
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fnAddTreeDataGradeAndLeaf = function AddTreeDataGradeAndLeaf(array: any[], levelName = 'level', childrenName = 'children') {
  const recursive = (array: any[], level = 0): any => {
    level++;
    return array.map((v: any) => {
      v[levelName] = level;
      const child = v[childrenName];
      if (child && child.length > 0) {
        v.isLeaf = false;
        recursive(child, level);
      } else {
        v.isLeaf = true;
      }
      return v;
    });
  };
  return recursive(array);
};

// flattened tree data
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fnFlattenTreeDataByDataList = function flattenTreeData(dataList: any[]) {
  const mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = fnTreeDataToMap(dataList);
  return fnGetFlattenTreeDataByMap(mapOfExpandedData);
};

// Obtain the flattened tree data, and the input parameter is treeData in the form of map
const fnGetFlattenTreeDataByMap = function getFlattenTreeData(mapOfExpandedData: { [key: string]: TreeNodeInterface[] }): TreeNodeInterface[] {
  const targetArray: TreeNodeInterface[] = [];
  Object.values(mapOfExpandedData).forEach(item => {
    item.forEach(item_1 => {
      targetArray.push(item_1);
    });
  });
  return targetArray;
};

export { fnTreeDataToMap, fnAddTreeDataGradeAndLeaf, fnFlatDataHasParentToTree, fnFlattenTreeDataByDataList, fnGetFlattenTreeDataByMap };
