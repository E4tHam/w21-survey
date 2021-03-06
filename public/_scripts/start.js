
/* start.js */


const app           = firebase.app();
const db            = firebase.firestore();

const SubmitButton  = document.getElementById( "SubmitButton" );
const NameInput     = document.getElementById( "NameInput" );

const CASE          = document.currentScript.getAttribute("case");
var TOKEN           = NaN;

const DATA_SET      = ( CASE.indexOf( "Independent" ) !== -1 ) ? "independent"
                    : ( CASE.indexOf( "Correlated"  ) !== -1 ) ? "correlated"
                    : "UNKNOWN";


var processes       = [ "temp" ];
db.collection( "onload_data" ).doc( DATA_SET )
        .collection( "processes" ).doc( "document_ids" )
    .get()
        .then( doc => {
            processes = doc.data().ids;
        }).catch(function(error) {
            console.error( "Error loading processes: ", error );
            alert( "Please try again later." );
        })
;
NameInput.disabled = false;




/* Buttons */

handle_NameInput();
function handle_NameInput() {
    SubmitButton.disabled = ( NameInput.value === "" );
}

async function handle_SubmitButton() {
    NameInput.disabled = true;
    SubmitButton.disabled = true;

    // calculate token
    TOKEN = return_token();

    // if token already exists in firebase
    await db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "metadata" )
        .get().then( doc => {
            if ( doc.exists )
                window.location.replace(
                    "../survey/?"
                    + "token=" + TOKEN
                );
        })
        .catch( )
    ;

    // store all information
    await store_information();

    // set process to 0
    // assign_process_order();
    await store_process();

    // redirect
    window.location.replace(
        "../survey/?"
        + "token=" + TOKEN
        + "&process=0"
        + "&practice"
    );
}




function assign_process_order() {
    // placeholder code
    let temp = processes;
    processes = [];
    while ( temp.length != 0 ) {
        let rand = Math.floor( Math.random() * temp.length );
        processes.push( temp[rand] );
        temp.splice( rand, 1 );
    }
}


function return_token() {
    return NameInput.value;
}


function store_information() {
    let date = new Date();
    return db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "information" ).set({
            name: NameInput.value,
            date: date.toUTCString()
        })
    .then(function() {
        console.log("Submission successfully written!");
    })
    .catch(function() {
        alert( "[Error]: Please try again." );
    });
}

function store_process() {
    return db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "metadata" ).set({
            finished_practice: false,
            finished: false,
            current: 0,
            order: processes
        })
    .then(function() {
        console.log("Process number successfully written!");
    })
    .catch(function() {
        alert( "[Error]: Please try again." );
    });
}
