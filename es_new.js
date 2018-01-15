"use strict";

// let circlearea = (r) => {
//     const PI = 3.14 ;
//     return PI * r * r;
// };
//
// let circleArea2 = (r) => 3.14 * r * r;
//
//
// console.log(circleArea2(10));

// Template Literals
//
// let name = "Bucky";
//
// console.log(`This is the white guy
// ${name}`);

// Class

class Person {

    constructor(name , age , weight){
        this.name = name;
        this.age = age;
        this.weight = weight;
    }

    displayWeight(){
        console.log(`This is the new ${this.weight} ${this.age} of the ${this.name}`);
    }
}

class Programmer extends Person {

    constructor(name , age , weight , language){
        super(name, age, weight);
        this.language = language;
    }

    getLanguage(){
        console.log(`My langualge is ${this.language}`);
    }
}

let bucky = new Programmer('Buka' , 87 , 567, 'java');
let sala = new Person('Sally' , 7 , 56);

bucky.displayWeight();
sala.displayWeight();