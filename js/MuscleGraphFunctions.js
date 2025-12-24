var muscleGraphWindow;
var muscleGraphs;

//For moving the window
var muscleWindowHeaderClicked = false;

var movementPending = false;
var lastEvent = null;
var startingPosition = {x: null, y: null};
var closed = false;


/* -----------INTERACTIONS WITH THE WINDOW----------- */
function headerClicked(event){
    event.preventDefault()

    let rect = muscleGraphWindow.getBoundingClientRect();

    startingPosition.x = event.clientX - rect.left;
    startingPosition.y = event.clientY - rect.top;

    console.log("Header clicked")
    muscleWindowHeaderClicked = true;
    document.addEventListener('mousemove', moveEventOrchestrator);
    document.addEventListener('mouseup', headerReleased)
}

function headerReleased(event){
    muscleWindowHeaderClicked = false;
    document.removeEventListener('mousemove', moveEventOrchestrator);
    document.removeEventListener('mouseup', headerReleased)
}

function moveEventOrchestrator(event){
    if(!muscleWindowHeaderClicked || closed) return;
    
    lastEvent = event;
    // prevent multiple animation requests from happening per frame
    if(!movementPending){
        movementPending = true;
        // lastEvent to ensure the movement is adjusted to the most recent info
        window.requestAnimationFrame( () =>{
            movementPending = false;
            mouseMoved(lastEvent)
        })
    }
}

/**
 * Clears all the graphs and then hides the viewer
 */
function closeMuscleGraphWindow(){
    closed = true;
    //since all graphs are the same size
    let rect = muscleGraphs[0].getBoundingClientRect();

    //clear graphs
    for(let graph of muscleGraphs){
        let ctx = graph.getContext("2d");
        ctx.beginPath();
        ctx.clearRect(0, 0 , rect.width, rect.height);
    }
    
    muscleGraphWindow.classList.add( "hidden");
}

function mouseMoved(event){
    let mouseX = event.clientX - startingPosition.x;
    let mouseY = event.clientY - startingPosition.y;
    moveWindow(mouseX, mouseY);

}
//on click and drag of the header for the muscle graphs, move the muscle graph to x and y
function moveWindow(x, y){
    console.log("Moving")
    muscleGraphWindow.style.top = y;
    muscleGraphWindow.style.left = x;
}


/**
 * Sets up all events pertaining to the muscle graphs and the viewer as a whole
 */
function setUpMuscleGraphEvents(){
    muscleGraphWindow = document.getElementById("muscleGraphWindow");
    muscleGraphs = [];
    for(let graph of document.getElementsByClassName('muscleGraph')){
        muscleGraphs.push(graph);
    }

    let header = document.getElementById("muscleGraphWindowHeader");
    header.addEventListener("mousedown", headerClicked);

    closed = muscleGraphWindow.classList.contains("hidden");
    
    let closeButton = document.getElementById('graphHeaderClose');
    closeButton.addEventListener("click", closeMuscleGraphWindow);
    

}