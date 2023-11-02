/*Configure permission code*/
export const ActionCode = {
  /*Tab page operation open details*/
  TabsDetail: 'admin:feat:tabs:example-detail',
  /* query form open to view */
  SearchTableDetail: 'admin:page-demo:search-table:example-detail',

  /*System Management*/
  AccountAdd: 'admin:system:account:add', // add account management
  AccountEdit: 'admin:system:account:edit', // account management edit
  AccountDel: 'admin:system:account:del', // account management delete

  /*role management*/
  RoleManagerAdd: 'admin:system:role-manager:add', // Add role management
  RoleManagerEdit: 'admin:system:role-manager:edit', // role management editor
  RoleManagerDel: 'admin:system:role-manager:del', // role management delete
  RoleManagerSetRole: 'admin:system:role-manager:set-role', // role management set role

  /*menu management*/
  MenuAdd: 'admin:system:menu:add', // menu added
  MenuEdit: 'admin:system:menu:edit', // menu edit
  MenuDel: 'admin:system:menu:del', // menu delete
  MenuAddLowLevel: 'admin:system:menu:addlowlevel', // menu add lower level

  /*department management*/
  DeptAdd: 'admin:system:dept:add', // add department management
  DeptEdit: 'admin:system:dept:edit', // department management editor
  DeptDel: 'admin:system:dept:del', // delete department management
  DeptAddLowLevel: 'admin:system:dept:addlowlevel' // department management add lower level
};
