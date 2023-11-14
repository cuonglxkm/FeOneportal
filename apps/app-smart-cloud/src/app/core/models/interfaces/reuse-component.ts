
export interface ReuseComponentInstance {
    _onReuseInit: () => void;
    _onReuseDestroy: () => void;
}

export interface ReuseComponentRef {
    instance: ReuseComponentInstance;
}
