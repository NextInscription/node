export interface order {
    transferHash: string,
    chainId: number,
    collectionId: string,
    callData: string,
    sender: string,
    receive: string,
    blockNumber: number,
    transferIndex: number,
    amount: number,
    type: number,
    status: number,
    isConfirmDeposit: number,
    remark?: string,
    createTime?: number,
}
export interface holder {
    addressSalt: string,
    collectionId: string,
    chainId: number
    address: string,
    tick: string,
    amount: number,
    lastBlock: number,
    lastTransferIndex: number
}
export interface collection {
    collectionId: string,
    decodeCollectionId: string,
    chainId: number,
    a: string,
    p: string,
    tick: string,
    max: number,
    lim: number,
    blockNumber: number,
    transferIndex: number,
    totalSupply: number,
    lastBlock: number,
    lastTransferIndex: number
    createTime?: number
}
export interface depositEvent {
    orderHash: string,
    collectionId: string,
    from: string,
    amount: number,
    blockNumber: number,
    transactionIndex: number,
    createTime?: number,
}
export interface responseEvents {
    collections: collection[]
    mints: order[]
    orders: order[]
    holders: holder[]
    depositEvents: depositEvent[],
    updateCollections: collection[],
    blockHashs:blockHash[],
    requestTime:number,
    handleDataTime:number
}

export interface txFormater {
    deploy: collection[],
    transfer: order[],
    mint: order[],
    blockNumber: number
}

export interface eventFormater {
    depositEvent: depositEvent[],
    transferEvent: order[]
}
export interface blockHash {
    id?:number,
    chainId:number,
    blockNumber:number,
    hash:string
}
