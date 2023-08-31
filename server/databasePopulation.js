"use strict";

const sqlite = require("sqlite3");

const db = new sqlite.Database('airplane.sqlite', (err) => {
  if (err) throw err;
});


//FUNZIONE CHE TRASFORMA NUMERO COLONNA IN LETTERA MAIUSCOLA 
const getCharacter = (valueToConvert, OFFSET)=>{
    return String.fromCharCode(valueToConvert+OFFSET);
}

//FUNZIONE CHIAMATA PER INSERIRE DATO DA 0 
const populate = async(id, flightNum, text) => {
    return new Promise((resolve, reject)=>{
        const sql = "INSERT INTO seats VALUES (?, 0, NULL, ?, ?)";
        db.run(sql, [id, flightNum, text], function(err){
            if(err) reject(err);
            resolve(this.changes);
        })
    });
}

//POPOLAZIONE DELLA TABELLA SEATS CON VALORI NULLI DI DEFAULT (booked = 0 e user = null)
async function standardPopulation(){
    const OFFSET = 65; //"A" è il numero 65
    const f=25;
    const p=6;
    let idValue=161;
    const flightNum = 3;
    let text;
    let changes;

    for(let rowNum=1; rowNum<=f; rowNum++){
        for(let colNum=0; colNum<p; colNum++){
            text = rowNum + getCharacter(colNum, OFFSET);
            changes = await populate(idValue, flightNum, text);
            if(changes<=0) console.log("Error with id= " + idValue + " flightNum= " + flightNum + " Seat=" + text);
            idValue = idValue + 1;
        }
    }
}

//standardPopulation();

//FUNZIONE CHE FA UPDATE DEL DATABASE
const update = async(userNum, id) => {
    return new Promise((resolve, reject)=>{
        const sql = "UPDATE seats SET booked=1, user= ? WHERE id = ?";
        db.run(sql, [userNum, id], function(err){
            if(err) reject(err);
            resolve(this.changes);
        })
    });
}

//UPDATE DELLA TABELLA SEATS CON PRENOTAZIONI INIZIALI
async function initialUpdate() {
    const userNum = 2;
    const idsToBeUpdated = [169, 170, 173, 82, 83, 84];
    let changes; 

    for(let id of idsToBeUpdated){
        changes = await update(userNum, id);
        if(changes<=0) console.log("Failed to update id= " + id);
    }
}

//initialUpdate();