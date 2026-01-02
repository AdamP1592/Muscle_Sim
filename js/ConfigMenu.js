var configWindow;
var selectedActivationType = null;

function clearActivationInput(){    
    var element = document.getElementById("activationFreq");
    element.value = "";
    console.log(element)
}

function submitActivationChange(){
    // confirm that an element is focused
    let focusedElementInd = focusedElementIndex;
    if(focusedElementInd === null) return;

    //grab the frequency
    let value = true;
    var freq = 0
    if(value !== null){
        //apply frequency if the value exists

        //since activation ids all end with Activation, strip the last 10 characters;
        const lastIndex = selectedActivationType.length - 10;
        const activationName = selectedActivationType.substring(0, lastIndex).trim()

        if(activationName == "sin" || activationName == "square"){
            freq = document.getElementById("activationFreq").value
        }
        sim.setStimulation(focusedElementInd, activationName, freq);

    }

    //clear the event and hide this window
    let activationParameterSubmit = document.getElementById("submitFreq")
    activationParameterSubmit.removeEventListener("click", submitActivationChange);
    configWindow.closeWindow();

}

function setupActivationInput(buttonID){
    selectedActivationType = buttonID;
    const parameterCount = {
        "sinActivation": 1,
        "squareActivation": 1,
        "constActivation": 0,
        "noneActivation": 0
    };
    let numParameters = parameterCount[buttonID];
    if(numParameters === 1){
        // show the hidden input fields
        let activationParameterWrapper = document.getElementById("activationParameterWrapper");
        let activationParameterSubmit = document.getElementById("submitFreq")
        activationParameterWrapper.classList.remove("hidden");
        activationParameterSubmit.addEventListener("click", submitActivationChange);
    }
    if(numParameters === 0){
        let activationParameterWrapper = document.getElementById("activationParameterWrapper");
        let activationParameterSubmit = document.getElementById("submitFreq")
        activationParameterWrapper.classList.add("hidden");
        submitActivationChange()
    }

    
    // identify which muscle is focused when click happens
    // put number of activa
}
function activationInputButtonClicked(event){
    console.log(event.target);
    setupActivationInput(event.target.id);
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
    configWindow.addCloseEvent(configWindowClose, clearActivationInput)
    for(let button of configMenuButtons){
        button.addEventListener('click', activationInputButtonClicked);
    }


}
