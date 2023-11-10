
export interface MenuListObj {
    menuName: string;
    code: string;
    alIcon: string;
    icon: string;
    orderNum: number;
    menuType: 'C' | 'F'; // C: menu, F: button
    path: string;
    visible: 0 | 1;
    status: boolean;
    newLinkFlag: 0 | 1;
}
