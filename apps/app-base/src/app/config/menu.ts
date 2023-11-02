/*
  * Only when the menu is statically loaded, the following comments can be turned on
  * And need to release the comment in the src/app/core/services/http/login/login.service.ts file
  * */

import { InjectionToken } from '@angular/core';

import { ActionCode } from '@config/actionCode';
import { Menu } from '@app/core/models/interfaces/types';

/!*Define menu*!/
export const MENU_TOKEN = new InjectionToken<Menu[]>('menu-token', {
  providedIn: 'root',
  factory(): Menu[] {
    return menuNav;
  }
});

const menuNav: Menu[] = [
  {
    menuName: 'Dashboard',
    id: 1,
    fatherId: "0",
    icon: 'dashboard',
    open: false,
    selected: false,
    menuType: 'C',
    path: '/admin/dashboard',
    code: ActionCode.TabsDetail,
    children: [
      {
        id: 1,
        fatherId: "0",
        menuName: 'Analysis',
        open: false,
        icon: 'fund',
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/dashboard/analysis'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Monitor',
        open: false,
        icon: 'fund',
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/dashboard/monitor'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Workplace',
        open: false,
        icon: 'appstore',
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/dashboard/workbench'
      }
    ]
  },
  {
    menuName: 'Page',
    icon: 'appstore',
    open: false,
    id: 1,
    fatherId: "0",
    code: ActionCode.TabsDetail,
    selected: false,
    menuType: 'C',
    path: '/admin/page-demo',
    children: [
      {
        id: 1,
        fatherId: "0",
        menuName: 'Form',
        icon: 'form',
        open: false,
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/page-demo/form',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Basic Form',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'form',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/form/base-form'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Step Form',
            open: false,
            selected: false,
            menuType: 'C',
            code: ActionCode.TabsDetail,
            icon: 'form',
            path: '/admin/page-demo/form/step-form'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Avanced Form',
            open: false,
            selected: false,
            menuType: 'C',
            code: ActionCode.TabsDetail,
            icon: 'form',
            path: '/admin/page-demo/form/advanced-form'
          }
        ]
      },
      {
        menuName: 'List',
        icon: 'table',
        open: false,
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        id: 1,
        fatherId: "0",
        path: '/admin/page-demo/list',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Search List',
            open: false,
            selected: false,
            menuType: 'C',
            code: ActionCode.TabsDetail,
            // icon: 'table',
            path: '/admin/page-demo/list/search-list',
            children: [
              {
                id: 1,
                fatherId: "0",
                menuName: 'Search List(articles)',
                open: false,
                selected: false,
                menuType: 'C',
                icon: 'table',
                code: ActionCode.TabsDetail,
                path: '/admin/page-demo/list/search-list/article'
              },
              {
                id: 1,
                fatherId: "0",
                menuName: 'Search List(project)',
                open: false,
                selected: false,
                menuType: 'C',
                icon: 'table',
                code: ActionCode.TabsDetail,
                path: '/admin/page-demo/list/search-list/project'
              },
              {
                id: 1,
                fatherId: "0",
                menuName: 'Search List(applications)',
                open: false,
                selected: false,
                menuType: 'C',
                icon: 'table',
                code: ActionCode.TabsDetail,
                path: '/admin/page-demo/list/search-list/application'
              }
            ]
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Search Table',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'table',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/list/search-table'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Tree Table',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'table',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/list/tree-list'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Standard Table',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'table',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/list/standard-table'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Card List',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'table',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/list/card-table'
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Detail Page',
        icon: 'profile',
        open: false,
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/page-demo/detail',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Basic Details',
            open: false,
            selected: false,
            menuType: 'C',
            code: ActionCode.TabsDetail,
            icon: 'profile',
            path: '/admin/page-demo/detail/base-detail'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Advanced Details',
            open: false,
            selected: false,
            menuType: 'C',
            code: ActionCode.TabsDetail,
            icon: 'profile',
            path: '/admin/page-demo/detail/adv-detail'
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Result',
        icon: 'check-circle',
        open: false,
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/page-demo/result',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Success',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'check-circle',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/result/success'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Fail',
            open: false,
            selected: false,
            menuType: 'C',
            code: ActionCode.TabsDetail,
            icon: 'check-circle',
            path: '/admin/page-demo/result/fail'
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Exception',
        icon: 'warning',
        open: false,
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/page-demo/except',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: '403',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            icon: 'warning',
            path: '/admin/page-demo/except/except403'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: '404',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'warning',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/except/except404'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: '500',
            open: false,
            selected: false,
            menuType: 'C',
            code: ActionCode.TabsDetail,
            icon: 'warning',
            path: '/admin/page-demo/except/except500'
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Profile',
        icon: 'user',
        open: false,
        selected: false,
        menuType: 'C',
        code: ActionCode.TabsDetail,
        path: '/admin/page-demo/personal',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Personal Center',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'user',
            code: ActionCode.TabsDetail,
            path: '/admin/page-demo/personal/personal-center'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Personal Settings',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            icon: 'user',
            path: '/admin/page-demo/personal/personal-setting'
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Graphic Editor',
        icon: '',
        alIcon: 'icon-mel-help',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/page-demo/flow',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Flow Editor',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'highlight',
            path: '/admin/page-demo/flow/flow-chat',
            code: ActionCode.TabsDetail
          }
        ]
      }
    ]
  },
  {
    id: 1,
    fatherId: "0",
    menuName: 'Features',
    icon: 'star',
    open: false,
    code: ActionCode.TabsDetail,
    selected: false,
    menuType: 'C',
    path: '/admin/feat',
    children: [
      {
        id: 1,
        fatherId: "0",
        menuName: 'Message',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/msg'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Download',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/download'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Icons',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/icons'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Context Menu',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/context-menu'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Image Preview',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/img-preview'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Fullscreen',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/full-screen'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Tabs',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/tabs'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Modal',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/ex-modal'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Drawer',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/ex-drawer'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Rich Text',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/rich-text'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'clickOutSide',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/click-out-side'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'External Document',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/frame',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Zorro Documentation',
            icon: 'dashboard',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            path: '/admin/feat/frame/zorro-doc'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'External Link',
            icon: 'usergroup-delete',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            path: 'https://github.com/huajian123/ng-ant-admin',
            newLinkFlag: 1
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Scroll',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/scroll',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Keep Scroll',
            icon: 'dashboard',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            path: '/admin/feat/scroll/keep-scroll-page'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Play Scroll',
            icon: 'dashboard',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            path: '/admin/feat/scroll/play-scroll'
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Chart',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/charts',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Gaode Map',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'highlight',
            path: '/admin/feat/charts/gaode-map',
            code: ActionCode.TabsDetail
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Baidu',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'highlight',
            path: '/admin/feat/charts/baidu-map',
            code: ActionCode.TabsDetail
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Echarts',
            open: false,
            selected: false,
            menuType: 'C',
            icon: 'highlight',
            path: '/admin/feat/charts/echarts',
            code: ActionCode.TabsDetail
          }
        ]
      },

      {
        id: 1,
        fatherId: "0",
        menuName: 'Color Picker',
        icon: 'usergroup-delete',
        code: ActionCode.TabsDetail,
        open: false,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/color-sel'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Session Timeout',
        icon: 'usergroup-delete',
        code: ActionCode.TabsDetail,
        open: false,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/session-timeout'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Ripple',
        icon: 'usergroup-delete',
        code: ActionCode.TabsDetail,
        open: false,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/ripple'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Clipboard',
        icon: 'usergroup-delete',
        code: ActionCode.TabsDetail,
        open: false,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/copy'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Empty Page',
        icon: 'usergroup-delete',
        code: ActionCode.TabsDetail,
        open: false,
        selected: false,
        menuType: 'C',
        path: '/blank/empty-page'
      },

      {
        id: 1,
        fatherId: "0",
        menuName: 'Editor',
        alIcon: 'icon-medium',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/editor'
      },

      {
        id: 1,
        fatherId: "0",
        menuName: 'Setup',
        alIcon: 'icon-medium',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/feat/setup'
      }
    ]
  },
  {
    id: 1,
    fatherId: "0",
    menuName: 'Components',
    icon: 'star',
    open: false,
    code: ActionCode.TabsDetail,
    selected: false,
    menuType: 'C',
    path: '/admin/comp',
    children: [
      {
        id: 1,
        fatherId: "0",
        menuName: 'Basic Components',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/comp/basic'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Animation',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/comp/transition'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Online Excel',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/comp/luckysheet'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Lazy Loading',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/comp/lazy',
        children: [
          {
            id: 1,
            fatherId: "0",
            menuName: 'Basic',
            icon: 'dashboard',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            path: '/admin/comp/lazy/lazy-basic'
          },
          {
            id: 1,
            fatherId: "0",
            menuName: 'Scroll',
            icon: 'dashboard',
            open: false,
            code: ActionCode.TabsDetail,
            selected: false,
            menuType: 'C',
            path: '/admin/comp/lazy/lazy-scroll'
          }
        ]
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Detail Component',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/comp/desc'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Password Verification',
        icon: 'dashboard',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/comp/strength-meter'
      }
    ]
  },

  {
    id: 1,
    fatherId: "0",
    menuName: 'System',
    icon: '',
    alIcon: 'icon-mel-help',
    open: false,
    code: ActionCode.TabsDetail,
    selected: false,
    menuType: 'C',
    path: '/admin/system',
    children: [
      {
        id: 1,
        fatherId: "0",
        menuName: 'Account',
        icon: '',
        alIcon: 'icon-mel-help',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/system/account'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Role',
        icon: '',
        alIcon: 'icon-mel-help',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/system/role-manager'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Menu',
        icon: '',
        alIcon: 'icon-mel-help',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/system/menu'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'Dept',
        icon: '',
        alIcon: 'icon-mel-help',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/system/dept'
      },
      {
        id: 1,
        fatherId: "0",
        menuName: 'User',
        icon: '',
        alIcon: 'icon-mel-help',
        open: false,
        code: ActionCode.TabsDetail,
        selected: false,
        menuType: 'C',
        path: '/admin/system/user'
      }
    ]
  },
  {
    id: 1,
    fatherId: "0",
    menuName: 'About',
    alIcon: 'icon-medium',
    open: false,
    code: ActionCode.TabsDetail,
    selected: false,
    menuType: 'C',
    path: '/admin/about'
  }
];