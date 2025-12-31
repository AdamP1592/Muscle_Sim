var configWindow;

function setupActivationButton(button){
    const options = {
        "sinActivation": 0,

    }
}
/**
 * 
 * @param {HTMLCollection} configMenuButtons 
 */
function setUpActivationButtonActions(configMenuButtons){
    for(let button of configMenuButtons){

    }
}
function configWindowSetup(){
    let configWindowObject = document.getElementById("configureMuscleWindow");
    let configWindowHeader = document.getElementById("configureWindowHeader");
    let configWindowClose = document.getElementById("configureWindowClose");
    let configMenuButtons = document.getElementsByClassName("muscleActivationButton");
    
    configWindow = new MinatureWindow(configWindowObject);
    configWindow.addMoveEvent(configWindowHeader);
    configWindow.addCloseEvent(configWindowClose)

}
