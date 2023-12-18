import { order, collection } from "../types";
import Web3 from "web3";
import _ from "lodash"
const web3 = new Web3()
export const validateOrder = (orders: order[], collections: collection[], holders: Object) => {
    orders = _.sortBy(orders, ["blockNumber", "transferIndex"])
    let successList = []
    orders.forEach(item => {
        if (item.type == 1) {
            let verification = handleMint(item, collections, holders)
            if (verification) {
                successList.push(item)
            }
        } else {
            let responseItem = handleTransfer(item, collections, holders)
            successList.push(responseItem)
        }
    })
    return { successList, updateHolders: Object.values(holders), updateCollections: collections }
}
export const handleTransfer = (item: order, collections: collection[], holders: Object) => {
    let find = collections.findIndex(collection => {
        let isTrue = false
        if (item.receive) {
            if (collection.collectionId == item.collectionId && collection.lastBlock == item.blockNumber && collection.lastTransferIndex < item.transferIndex) {
                isTrue = true
            } else if (collection.collectionId == item.collectionId && collection.lastBlock < item.blockNumber) {
                isTrue = true
            }
        }
        return isTrue
    })
    if (find != -1) {
        let collection = collections[find]
        let senderSalt = web3.utils.keccak256(`${item.collectionId}${item.sender}`)
        let receiveSalt = web3.utils.keccak256(`${item.collectionId}${item.receive}`)
        if (!holders[senderSalt]) {
            item.status = 2
            item.remark = "Insufficient Balance"
            return item
        }
        let sender = holders[senderSalt]
        if (sender.amount < item.amount) {
            item.status = 2
            item.remark = "Insufficient Balance"
            return item
        }
        sender.amount -= Number(item.amount)
        sender.lastBlock = item.blockNumber
        sender.lastTransferIndex = item.transferIndex
        holders[senderSalt] = { ...sender }
        if (!holders[receiveSalt]) {
            holders[receiveSalt] = {
                addressSalt: receiveSalt,
                collectionId: item.collectionId,
                chainId: item.chainId,
                address: item.receive,
                tick: collection.tick,
                amount: item.amount,
                lastBlock: item.blockNumber,
                lastTransferIndex: item.transferIndex
            }
        } else {
            let holder = holders[receiveSalt];
            holder.amount += Number(item.amount)
            holder.lastBlock = item.blockNumber
            holder.lastTransferIndex = item.transferIndex
            holders[receiveSalt] = { ...holder }
        }
        return item
    } else {
        item.status = 2
        item.remark = "Insufficient Balance"
        return item
    }
}
export const handleMint = (item: order, collections: collection[], holders: Object) => {
    let find = collections.findIndex(collection => {
        let isTrue = false
        if (collection.max >= Number(item.amount) + Number(collection.totalSupply) && Number(item.amount) == Number(collection.lim) && item.receive) {
            if (collection.collectionId == item.collectionId && collection.lastBlock == item.blockNumber && collection.lastTransferIndex < item.transferIndex) {
                isTrue = true
            } else if (collection.collectionId == item.collectionId && collection.lastBlock < item.blockNumber) {
                isTrue = true
            }
        }
        return isTrue
    })
    if (find != -1) {
        let collection = collections[find]
        collection.totalSupply = Number(item.amount) + Number(collection.totalSupply)
        collection.lastBlock = item.blockNumber
        collection.lastTransferIndex = item.transferIndex
        collections[find] = collection
        let addressSalt = web3.utils.keccak256(`${item.collectionId}${item.receive}`)
        if (!holders[addressSalt]) {
            holders[addressSalt] = {
                addressSalt: addressSalt,
                collectionId: item.collectionId,
                chainId: item.chainId,
                address: item.receive,
                tick: collection.tick,
                amount: item.amount,
                lastBlock: item.blockNumber,
                lastTransferIndex: item.transferIndex
            }
        } else {
            let holder = holders[addressSalt];
            holder.amount += Number(item.amount)
            holder.lastBlock = item.blockNumber
            holder.lastTransferIndex = item.transferIndex
            holders[addressSalt] = { ...holder }
        }
        return true
    } else {
        return false
    }

}