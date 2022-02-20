import { addContract, getContracts,removeContract } from '../index';
import { SmartContract } from '../model';
import { VMContext, Context, u128,PersistentVector } from 'near-sdk-as';

function createSmartContract(id: string,name:string,type:string): SmartContract {
  return new SmartContract(id,name,type);
}

let contracts = new PersistentVector<SmartContract>(Context.sender);

const contract = createSmartContract('1234','contract1',"Rust");

describe('smart contract tests', () => {
  afterEach(() => {
    while(contracts.length > 0) {
      contracts.pop();
    }
  });

  it('adds a contract', () => {
    addContract('1234','contract1','Rust');
    expect(contracts.length).toBe(
      1,
      'should only contain one contract'
    );
    expect(contracts[0].name).toStrictEqual(
      contract.name,
      'contract1'
    );
  });


  it('retrieves contracts', () => {
    addContract('1234','contract1',"Rust");
    const contractsArr = getContracts(Context.sender);
    expect(contractsArr.length).toBe(
      1,
      'should be one contract'
    );
    expect(contractsArr).toIncludeEqual(
      contract,
      'contracts should include:\n' + contract.toJSON()
    );
  });


});

