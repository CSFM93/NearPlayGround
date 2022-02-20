import { context, logging, PersistentVector } from "near-sdk-as";
import { SmartContract } from './model';



export function addContract(id: string, name: string, type: string): void {
    const newContract = new SmartContract(id, name, type);
    var contracts = new PersistentVector<SmartContract>(context.sender);
    contracts.push(newContract)
    logging.log(`contract added: ${name}, accountId: ${context.sender}`);

}


export function getContracts(accountId: string): SmartContract[] {

    var persistedData = new PersistentVector<SmartContract>(accountId);
    const contracts = new Array<SmartContract>();
    for (let i = 0; i < persistedData.length; i++) {
        contracts.push(persistedData[i]);
    }
    logging.log("contracts retrieved: " + contracts.length.toString());
    return contracts

}

export function removeContract(id: string): void {
    var contracts = new PersistentVector<SmartContract>(context.sender);
    var index = 0;
    for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].id.includes(id)) {
            index = i;
            break;
        }
    }
    var contractName = contracts[index].name
    contracts.swap_remove(index);

    logging.log(`contract removed: ${contractName}, accountId: ${context.sender}`);
}

