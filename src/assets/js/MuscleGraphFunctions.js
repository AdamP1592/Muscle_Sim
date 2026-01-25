
var muscleMiniWindow;
var muscleCanvases;

/**
 * Clears all the graphs and then hides the viewer
 */
function closeMuscleGraphWindow(){
    muscleGraphClosed = true;
    //since all graphs are the same size
    let rect = muscleCanvases[0].getBoundingClientRect();
    sim.clearElementBorders();
    //clear graphs
    focusedElementIndex = null;
    for(let graph of muscleCanvases){
        let ctx = graph.getContext("2d");
        ctx.beginPath();
        ctx.clearRect(0, 0 , rect.width, rect.height);
    }
    muscleGraphs = [];
    //muscleGraphWindow.classList.add( "hidden");
}

/**
 * Sets up all events pertaining to the muscle graphs and the viewer as a whole
 */
function setUpMuscleGraphEvents(){
    muscleGraphWindow = document.getElementById("muscleGraphWindow");
    let header = document.getElementById("muscleGraphWindowHeader");
    let closeButton = document.getElementById('graphHeaderClose');

    muscleMiniWindow = new MinatureWindow(muscleGraphWindow);

    muscleMiniWindow.addMoveEvent(header);
    muscleMiniWindow.addCloseEvent(closeButton, closeMuscleGraphWindow);

    muscleCanvases = [];
    for(let graph of document.getElementsByClassName('muscleGraph')){
        muscleCanvases.push(graph);
    }
}