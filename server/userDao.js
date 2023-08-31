"use strict";

const sqlite = require("sqlite3");
const crypto = require("crypto");

//OPEN DB
'use strict';
const db = new sqlite.Database('airplane.sqlite', (err) => {
  if (err) throw err;
});


exports.getUser = (username, password) => {
    return new Promise((resolve, reject) =>{
        const sql = "SELECT * from users where username like ?";
        db.get(sql, [username], (err, row) =>{
            if(err) reject(err);
            else if(row === undefined) resolve(false);
            else{
                const user = {id: row.id, username: row.username, name: row.name};
                crypto.scrypt(password, row.salt, row.keylen, function(err, hashedPassword){
                    if(err) reject(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row.password, "hex"), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        });
    })
}

