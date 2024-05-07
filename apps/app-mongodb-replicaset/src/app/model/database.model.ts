export interface Collection {
    db : string,
    collection : string,
    max_size : number,
    time_field : string,
    meta_field : string,
    granularity : string,
    type: string
}

export interface CollectionInfo {
    coll : string,
    collection_type : string
    storage_size : number,
    size : number,
    free_storage_size : number,
    document_total : number,
    avgObjectSize : number,
    indexes : number,
    totalIndexSize : number
}