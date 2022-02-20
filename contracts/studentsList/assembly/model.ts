import { context } from "near-sdk-as";


@nearBindgen
export class Student {
    id: string;
    name: string;
    age: i32;
    gpa: f32;
    knowsJavaScript:bool;
    constructor(Id: string, Name: string,Age: i32,Gpa:f32,KnowsJavaScript: bool) {
        this.id = Id;
        this.name = Name;
        this.age = Age;
        this.gpa = Gpa;
        this.knowsJavaScript = KnowsJavaScript;

    }
}


