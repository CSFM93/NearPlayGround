import { context, logging, PersistentVector } from "near-sdk-as";
import { Student } from './model';
// carlos
// Mucuho bbbbaaaa

export function addStudent(id: string, name: string, age: i32, gpa: f32, knowsJavaScript: bool): void {
    const newStudent = new Student(id, name, age, gpa, knowsJavaScript);
    var Students = new PersistentVector<Student>("students"); 
    Students.push(newStudent)
    logging.log(`Student added: ${name}, accountId: ${context.sender}`);
}



export function getStudents(): Student[] {
    var persistedData = new PersistentVector<Student>("students");
    const Students = new Array<Student>();
    for (let i = 0; i < persistedData.length; i++) {
        Students.push(persistedData[i]);
    }
    logging.log("Students retrieved: " + Students.length.toString());
    return Students
}


export function filterByJSKnowledge(knowsJavaScript: bool): Student[] {
    var persistedData = new PersistentVector<Student>("students");
    const Students = new Array<Student>();
    
    for (let i = 0; i < persistedData.length; i++) {
        if(persistedData[i].knowsJavaScript === knowsJavaScript){
            Students.push(persistedData[i]);
        }
    }
    logging.log("Students found after filtering: " + Students.length.toString());
    return Students
}


export function removeStudent(id: string): void {
    var Students = new PersistentVector<Student>("students");
    var index = 0;
    for (let i = 0; i < Students.length; i++) {
        if (Students[i].id.includes(id)) {
            index = i;
            break;
        }
    }
    var StudentName = Students[index].name
    Students.swap_remove(index);
    logging.log(`Student removed: ${StudentName}, accountId: ${context.sender}`);
}

