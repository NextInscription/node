# Document
### Run NextInscription node
npm install   
npm run sync
### Api
```cpp
http://127.0.0.1:7777/api/getCollection
```
| Key          | Required? |
| :----------- | :-------- |
| collectionId | yes       |

```cpp
http://127.0.0.1:7777/api/getAmount
```
| Key          | Required? |
| :----------- | :-------- |
| address      | yes       |
| collectionId | yes       |

```cpp
http://127.0.0.1:7777/api/getHolders
```
| Key          | Required? |
| :----------- | :-------- |
| collectionId | yes       |

```cpp
http://127.0.0.1:7777/api/getBlock
```
| Key         | Required? |
| :---------- | :-------- |
| chainId     | yes       |
| blockNumber | yes       |

### Concepts


1、**Fair Distribution**:A tokenized protocol for fair launch of inscriptions, allowing everyone to participate fairly.   
2、**Balance Accounting**:Flexibility and gas savings in transfers through balance accounting.    
3、**Node Consensus**:After deployment, our node synchronization methods will be publicly disclosed via npm packages, enabling oversight of the fairness of accounting.    
4、**Node Consensus**:Once the market stabilizes, consensus nodes will be employed to verify the security and accuracy of all node data. 

### Agreements
1、Mint tokens only with from=to.   
2、Do not support batch minting through contracts.   
3、Mint hashes will no longer be recorded.   
### Specifications
1、**deploy**:Used to deploy the NextInscription protocol for token issuance.   
2、**mint**:Used to mint tokens according to the NextInscription protocol.   
3、**transfer**:Used for transferring tokens under the NextInscription protocol.   
4、**deposit**:Used for staking tokens under the NextInscription protocol.  
4、**Xtransfer**:Used for cross tokens under the NextInscription protocol.    
5、**NextInscriptionDeposit**:Event triggered when a deposit is confirmed under the NextInscription protocol.   
6、**NextInscriptionContractTransfer**: Event triggered when a token transfer within the NextInscription protocol contract occurs.   
### Deploy
```cpp
data:,{"a":"NextInscription","p":"oprc-20","op":"deploy","tick":"NI","max":"210000000000","lim":"10000"}
```
| Key  | Required? |                                                         Desc |
| :--- | :-------- | -----------------------------------------------------------: |
| a    | yes       |                                              NextInscription |
| p    | yes       |                            Token protocol max length 10,*-20 |
| op   | yes       |                                       Operation type: deploy |
| tick | yes       |                                     Token name max length 18 |
| max  | yes       | Total token supply (must be a multiple of lim) max length 18 |
| lim  | yes       |                          Mint token quantity limit max%lim=0 |

### Mint
```cpp
data:,{"a":"NextInscription","p":"oprc-20","op":"mint","tick":"NI","amt":"10000"}
```
| Key  | Required? |                 Desc |
| :--- | :-------- | -------------------: |
| a    | yes       |      NextInscription |
| p    | yes       |       Token protocol |
| op   | yes       | Operation type: mint |
| tick | yes       |           Token name |
| amt  | yes       |             Mint lim |

### Transfer
```cpp
data:,{"a":"NextInscription","p":"oprc-20","op":"transfer","tick":"NI","amt":"10000"}
```
| Key  | Required? |                     Desc |
| :--- | :-------- | -----------------------: |
| a    | yes       |          NextInscription |
| p    | yes       |           Token protocol |
| op   | yes       | Operation type: transfer |
| tick | yes       |               Token name |
| amt  | yes       |          Transfer amount |
| gen  | no        |        Genesis chain ID |
### Deposit
```cpp
data:,{"a":"NextInscription","p":"oprc-20","op":"deposit","tick":"NI","amt":"10000","to":"0x"}
```
| Key  | Required? |                              Desc |
| :--- | :-------- | --------------------------------: |
| a    | yes       |                   NextInscription |
| p    | yes       |                    Token protocol |
| op   | yes       |           Operation type: deposit |
| tick | yes       |                        Token name |
| amt  | yes       |                    Deposit amount |
| to   | yes       | Recipient address for the deposit |
| gen  | no        |                 Genesis chain ID |
### Xtransfer
```cpp
data:,{"a":"NextInscription","p":"oprc-20","op":"Xtransfer","tick":"NI","amt":"10000","gen":"137","x":"56"}
```
| Key  | Required? |                              Desc |
| :--- | :-------- | --------------------------------: |
| a    | yes       |                   NextInscription |
| p    | yes       |                    Token protocol |
| op   | yes       |         Operation type: Xtransfer |
| tick | yes       |                        Token name |
| amt  | yes       |                    Deposit amount |
| to   | yes       | Recipient address for the deposit |
| gen  | yes       |                 Genesis chain ID |
| x    | yes       |                    Cross chain ID |
### NextInscriptionDeposit
```cpp
event NextInscriptionDeposit(
    bytes32 indexed orderHash,
    bytes32 indexed collectionId,
    uint256 indexed amount 
);
//Used to pledge inscription tokens for successful callback of contracts
```
### NextInscriptionContractTransfer
```cpp
event NextInscriptionContractTransfer(
    bytes32 indexed collectionId,
    address indexed receive,
    uint256 indexed amount 
);
//Internal token transfer within the contract, used for contract transfers
```
