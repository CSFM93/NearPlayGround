import { addStudent, getStudents, removeStudent,filterByJSKnowledge } from '../index';
import { Student } from '../model';
import { VMContext, Context, u128, PersistentVector } from 'near-sdk-as';

function createStudent(id: string, name: string, age: i32, gpa: f32, knowsJavaScript: bool): Student {
  return new Student(id, name, age, gpa, knowsJavaScript);
}

let contracts = new PersistentVector<Student>('students');
const contract = createStudent('1234', 'carlos', 18, 2.0, true);

describe('studentList smart contract tests', () => {
  afterEach(() => {
    while (contracts.length > 0) {
      contracts.pop();
    }
  });

  it('adds a contract', () => {
    addStudent('1234', 'carlos', 18, 2.0, true);
    expect(contracts.length).toBe(
      1,
      'should only contain one student'
    );
    expect(contracts[0].name).toStrictEqual(
      contract.name,
      'carlos'
    );
  });


  it('retrieves contracts', () => {
    addStudent('1234', 'carlos', 18, 2.0, true);
    const contractsArr = getStudents();
    expect(contractsArr.length).toBe(
      1,
      'should be one student'
    );
    expect(contractsArr).toIncludeEqual(
      contract,
      'students should include:\n' + contract.toJSON()
    );



  });

  it('filters contracts', () => {
    addStudent('1234', 'carlos', 18, 2.0, true);
    addStudent('1234', 'john', 20, 2.0, false);
    addStudent('1234', 'alice', 22, 2.0, false);

    const contractsArr = filterByJSKnowledge(true);

    expect(contractsArr.length).toBe(
      1,
      'should be one student'
    );
    
    const contractsArr2 = filterByJSKnowledge(false);
    expect(contractsArr2.length).toBe(
      2,
      'should be two students'
    );
  });


});

