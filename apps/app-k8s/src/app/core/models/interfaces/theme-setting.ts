
export interface SettingInterface {
    theme: 'dark' | 'light'; // theme mode (dark mode, light mode)
    color: string; // theme color
    mode: 'side' | 'top' | 'mixi'; // menu mode (side mode, top mode, mixed mode)
    colorWeak: boolean; // color weakness
    greyTheme: boolean; // gray mode
    fixedHead: boolean; // fixed head
    splitNav: boolean; // Whether to split the menu (only takes effect when the menu mode is mixed mode)
    fixedLeftNav: boolean; // fixed left menu
    isShowTab: boolean; // Whether to display multiple tabs
    fixedTab: boolean; // fixed tab page
    hasTopArea: boolean; // Whether to display the top area
    hasFooterArea: boolean; // whether to display the bottom area
    hasNavArea: boolean; // Whether there is a menu
    hasNavHeadArea: boolean; // Whether the menu has a menu header
}

export interface NormalModel {
    image?: string;
    title: string;
    isChecked: boolean;
}

export interface Theme extends NormalModel {
    key: 'dark' | 'light';
}

export interface Color extends NormalModel {
    key: string;
    color: string;
}

export interface ThemeMode extends NormalModel {
    key: 'side' | 'top' | 'mixi';
}