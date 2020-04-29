/* eslint-disable no-invalid-this*/
/* eslint-disable no-undef*/
// IMPORTS
const path = require("path");
const Utils = require("./testutils");
const spawn = require("child_process").spawn;
const fs = require("fs");

const process = require("process")
var Git = require("nodegit");


// CRITICAL ERRORS
let error_critical = null;


// TESTS
//
// - **20%:** Los quizzes se eligen aleatoriamente.
// - **20%:** No se repiten los quizzes.
// - **20%:** Se termina si no quedan más quizzes.
// - **20%:** Si se responde bien, continúa el juego.
// - **20%:** Al fallar se termina el juego.

// Comprobar rama entrega8?

var orig_it = it;


const TEST_PORT =  typeof process.env.TEST_PORT !== "undefined"?parseInt(process.env.TEST_PORT):3001;
const LOG_SERVER =  typeof process.env.LOG_SERVER !== "undefined";
const DEBUG =  typeof process.env.DEBUG !== "undefined";
const WAIT =  typeof process.env.WAIT !== "undefined"?parseInt(process.env.WAIT):50000;
const TIMEOUT =  typeof process.env.TIMEOUT !== "undefined"?parseInt(process.env.TIMEOUT):2000;
const COOLDOWN =  typeof process.env.COOLDOWN !== "undefined"?parseInt(process.env.COOLDOWN):0;


const path_assignment = path.resolve(path.join(__dirname, "../", "quiz_2020"));
const URL = `file://${path_assignment.replace("%", "%25")}`;
const browser = new Browser({"waitDuration": WAIT, "silent": true, "runScripts": false});


function log() {
    if(DEBUG) {console.log.apply(this, arguments );}
}

async function sleep(msecs) {
    await new Promise(resolve => setTimeout(resolve, msecs));
}

async function visit() {
    log('\tVisiting: ', arguments[0])
    await browser.visit.apply(browser, arguments);
    return sleep(COOLDOWN);

}

// Cambiar si cambia el seeder
const questions = [
    {
        question: 'Capital of Italy',
        answer: 'Rome',
    },
    {
        question: 'Capital of Portugal',
        answer: 'Lisbon',
    },
    {
        question: 'Capital of Spain',
        answer: 'Madrid',
    },
    {
        question: 'Capital of France',
        answer: 'Paris',
    }
]

// Preguntas incorrectas para probar el corrector
// const questions = [
//     {
//         question: 'Capital of Italy',
//         answer: 'No',
//     },
//     {
//         question: 'Capital of Portugal',
//         answer: 'No',
//     },
//     {
//         question: 'Capital of Spain',
//         answer: 'No',
//     },
//     {
//         question: 'Capital of France',
//         answer: 'No',
//     }
// ]

it = function(name, score, func) {
    return orig_it(name, async function () {
        this.score = score;
        this.msg_ok = null;
        this.msg_err = null;
        if(error_critical) {
            this.msg_err = 'No se puede realizar el test porque hay un fallo anterior.';
            throw Error(this.msg_err);
        }
        try {
            res = await func.apply(this, []);
            if(!this.msg_ok) {
                this.msg_ok =  "¡Enhorabuena!";
            }
        } catch(e){
            if(!this.msg_err) {
                this.msg_err =  "Ha habido un fallo";
            }
            log("Exception in test:", e);
            throw(e);
        }
    })
}

describe("Prechecks", function () {
    it("1: Comprobando que existe el directorio de la entrega...",
       0,
       async function () {
           this.msg_ok = `Encontrado el directorio '${path_assignment}'`;
           this.msg_err = `No se encontró el directorio '${path_assignment}'`;
           const fileexists = await Utils.checkFileExists(path_assignment);

           if (!fileexists) {
               error_critical = this.msg_err;
           }
           fileexists.should.be.equal(true);
       });

    it("1: Comprobando que existe la rama entrega8",
       0,
       async function () {
           this.msg_err = "No se encuentra la rama entrega8"
           repo = await Git.Repository.open(path_assignment);
           commit = await repo.getBranchCommit("entrega8")
       });
});


describe("Funcionales", function(){

    var server;
    const db_file = path.join(path_assignment, '..', 'quiz.sqlite');

    before(async function() {

        let err = null;
        try{
            // Crear base de datos nueva y poblarla antes de los tests funcionales. por defecto, el servidor coge quiz.sqlite del CWD
            err = `Existe una base de datos en ${db_file}, pero no hemos podido borrarla.`;
            if (fs.existsSync(db_file)) {
                fs.unlinkSync(db_file);
            }
            err = "No hemos podido crear la base de datos";
            fs.closeSync(fs.openSync(db_file, 'w'));

            let sequelize_cmd = path.join(path_assignment, "node_modules", ".bin", "sequelize");
            err = "No hemos podido lanzar las migraciones";
            await exec(`${sequelize_cmd} db:migrate --url "sqlite://${db_file}" --migrations-path ${path.join(path_assignment, "migrations")}`);
            err = "No hemos podido lanzar las seeds";
            await exec(`${sequelize_cmd} db:seed:all --url "sqlite://${db_file}" --seeders-path ${path.join(path_assignment, "seeders")}`);

            let bin_path = path.join(path_assignment, "bin", "www");

            err = `Parece que no se puede lanzar el servidor con el comando "node ${bin_path}".`;
            server = spawn('node', [bin_path], {env: {PORT: TEST_PORT}});

            if(LOG_SERVER) {
                server.stdout.on('data', function(data) {
                    log('\t\tServer: ', data.toString()); 
                });
            }

            server.stderr.on('data', function(data) {
                console.log('\t\tError en el servidor: ', data.toString()); 
            });

            await new Promise(resolve => setTimeout(resolve, TIMEOUT));

            // The exit code should be null while the server is running
            if(server.exitCode) {
                throw Error("El servidor se ha parado.");
                
            }

            browser.site = `http://localhost:${TEST_PORT}/`;
            await browser.visit("/");
            browser.assert.status(200);

        } catch(e) {
            console.log(err);
            console.log();
            console.log('Este es un error crítico, así que no podemos realizar el resto de tests.');
            console.log();
            log(e);
            error_critical = err;
        }
    });

    after(async function() {
        // Borrar base de datos
        if(server){
            server.kill();
            await new Promise(resolve => setTimeout(resolve, 500));
            fs.unlinkSync(db_file);
        }
    })

    it("0: La barra de navegación incluye un botón de play",
       1,
       async function(){ 
           this.msg_err = "No se pudo acceder a /quizzes";
           await visit("/quizzes");
           browser.assert.status(200)
           this.msg_err = "No se encuentra el botón";
           browser.assert.text('a[href="/quizzes/randomplay"]', "Play")
       });

    it("1: Los quizzes se eligen aleatoriamente",
       2,
       async function () {
           // Lanzamos 10 intentos de partida, sin cookies. Debería haber más de 2 preguntas diferentes

           let visited = {}
           let num = 0;

           for(var i=0; i<10; i++) {
               this.msg_err = 'No se ha podido acceder a randomplay';
               await visit("/quizzes/randomplay");
               browser.assert.status(200)
               att = browser.query('form')
               if(!visited[att.action]) {
                   visited[att.action] = 1;
                   num++;
               } else {
                   visited[att.action]++;
               }
               browser.deleteCookies();
           }

           this.msg_err = `Se repite el orden de los quizzes`;
           num.should.be.above(1)
       });

    it("2: No se repiten los quizzes",
       2,
       async function () {
           // Hacer dos partidas, comprobar que el orden de las preguntas es diferente


           let visited = {}
           let num = 0;

           browser.deleteCookies();

           for(var i=0; i<questions.length; i++) {
               this.msg_err = "No se ha podido acceder a /quizzes/randomplay";
               await visit("/quizzes/randomplay");
               browser.assert.status(200)
               att = browser.query('form')
               if(!visited[att.action]) {
                   visited[att.action] = 1;
                   num++;
               } else {
                   this.msg_err = `Quiz repetido: ${att.action}`
                   throw Error(this.msg_err)
               }
               let tokens = att.action.split("/")
               let id = parseInt(tokens[tokens.length-1])
               let q = questions[id-1]
               let answer = q.answer
               this.msg_err = `No se ha podido acceder a /quizzes/randomcheck/${id}?answer=${answer}`;
               await visit(`/quizzes/randomcheck/${id}?answer=${answer}`)
           }
       });

    it("3: Se termina si no quedan más quizzes",
       2,
       async function () {

           this.msg_err = "Error al acceder a randomplay";
           await visit("/quizzes/randomplay");
           att = browser.query('form')
           this.msg_err = "Se han respondido todas las preguntas, pero el juego continúa";

           if(att){
               let tokens = att.action.split("/")
               let id = parseInt(tokens[tokens.length-1])
               this.msg_err = `${this.msg_err} con la pregunta ${id}`;
               throw Error(this.msg_err)
           }
           log(browser.html);
           this.msg_err = "El juego no continúa, pero no se visualiza la página correcta";
           browser.assert.text("section>h1", "End of Random Play:")
       });

    it("4: Si se responde bien, continúa el juego",
       1,
       async function () {

           for(var i=0; i< 10; i++) {
               this.msg_err = "No se ha podido acceder a /quizzes/randomplay";
               await visit("/quizzes/randomplay");
               browser.assert.status(200);
               att = browser.query('form');
               let tokens = att.action.split("/");
               const id = parseInt(tokens[tokens.length-1])
               let question = questions[id-1]
               let answer = question.answer

               this.msg_err = `No acepta la respuesta correcta para ${question.question} (${question.answer})`
               await visit(`/quizzes/randomcheck/${id}?answer=${answer}`)
               browser.assert.status(200)
               this.msg_err = `Tras una respuesta correcta, se repite la pregunta`
               await visit("/quizzes/randomplay");
               att = browser.query('form');
               tokens = att.action.split("/")
               new_id = parseInt(tokens[tokens.length-1])
               id.should.not.be.equal(new_id)
               browser.deleteCookies();
           }
       });

    it("5: Al fallar se termina el juego",
       1,
       async function () {
           this.msg_err = "No permite acceder a /quizzes/randomplay/";

           browser.deleteCookies();
           await visit("/quizzes/randomplay");
           browser.assert.status(200);
           this.msg_err = "No permite acceder a /quizzes/randomcheck/ con una respuesta incorrecta";
           await visit("/quizzes/randomcheck/1?answer=This answer is wrong")
           browser.assert.status(200);

           this.msg_err = "Al fallar una pregunta no muestra la pantalla correcta";
           browser.assert.text("section>h1", "Random Play:")
           browser.text().includes("You have failed").should.equal(true)
       });

    it("6: Se puntúa bien el número de aciertos",
       1,
       async function () {
           this.msg_err = "No continúa pese a responder bien";

           // Repetimos dos veces, para asegurarnos.
           for(var j=0; j<2; j++){
               browser.deleteCookies();
               for(var i=0; i< questions.length; i++) {
                   this.msg_err = `Error al acceder a randomplay (en el intento número ${i+1})`;
                   await visit("/quizzes/randomplay");
                   browser.assert.status(200);
                   att = browser.query('form');
                   let tokens = att.action.split("/");
                   const id = parseInt(tokens[tokens.length-1])
                   let question = questions[id-1]
                   let answer = question.answer
                   this.msg_err = `No acepta la respuesta correcta para ${question.question} (${question.answer})`
                   await visit(`/quizzes/randomcheck/${id}?answer=${answer}`);
                   browser.assert.status(200)
                   const body = browser.text('section')
                   let num_aciertos = i+1
                   this.msg_err = `Esperaba ${num_aciertos} acierto(s), la página muestra ${body}`
                   body.includes(`Successful answers = ${num_aciertos}`).should.equal(true)
               }
           }
       });
});
