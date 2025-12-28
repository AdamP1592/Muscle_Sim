//for highlighting the focused button
var focused_button = null;

//for ctrl + (key) events
var controlPressed = false;

//for inspecting element values
var inspection = false;
var trash = false;
var move = false;
var configure = false;

//pausing
var isPaused = false;
var totalPausedTime = 0;
var pauseStartTime = 0;

//hover event stuff
var mouseHoverX = 0;
var mouseHoverY = 0;

//for property view
var propView = null;

var focusedElementIndex = null;
/**
 * if a click is released, place the object that corresponds with the button that was pressed
 * @param {*} event 
 */
function click_released(event){
  let x = event.clientX;
  let y = event.clientY;

  let [graphX, graphY] = convertClientCoordsToGraph(x, y)
  //in bounds
  if(!( graphX < 0 || graphX < 0 || graphX > maxX || graphX > maxY)){

    switch(buttonID){
      case "fixed_spawn":
        sim.createFixedSquare(graphX, graphY)
        break;
      case "move_spawn":
        sim.createMoveableSquare(graphX, graphY)
        break;
    }
  }
  else{
    console.log("Out of bounds")
  }
  //reset event listeners and classes
  let main = document.getElementById("main")
  main.classList.remove('hover_with_obj');
  document.removeEventListener('mouseup', click_released)
} 
/**
 * A click event function for buttons 
 * @param {*} event 
 */
function onclick_event(event){
  button = event.srcElement
  buttonID = event.srcElement.id
  document.addEventListener('mouseup', click_released);

  let main = document.getElementById("main");
  main.classList.add('hover_with_obj');
  
}

function keyPressed(event){
  if(event.key === "Control"){
    controlPressed = true;
  }
  if(event.key === " "){
    event.preventDefault()

    pauseButtonClicked();
  }
}
function keyReleased(event){
  if(event.key === "Control"){
    controlPressed = false;
  }
}

/**
 * A click event used for muscle creation. 
 * If control is pressed when clicking any subclass of rect, add that to the list of objects that will be getting a muscle.
 * Once two objects are clicked, create a muscle.
 * If you click a rect that has already been clicked, remove it from the list of objects.
 * @param {*} event 
 */
function leftClickCanvas(event) {
  event.preventDefault();
  const[graphX, graphY] = convertClientCoordsToGraph(event.clientX, event.pageY)

  let borderCount = 0;
  //to prevent having to index a list
  let objectsWithBorders = {};
  for(let [index, obj] of sim.objects){

    //if there was a square that got clicked
    if (isWithinRect(graphX, graphY, obj)) {
      // if the trash control option is selected delete what was clicked and all connected muscles
      if(trash){
        sim.deleteObject(index);
      }
      // if control was pressed, add a border. If two have borders make a muscle
      else if(controlPressed){
      //all squares are positioned center to x and y
    
        //if it hasn't been clicked yet, add it to the list of clicked
        if(obj.border == false){
          console.log("Adding border")
          obj.border = true;
          objectsWithBorders[index] = obj;
          borderCount += 1;
        }else{
          //if it has been clicked, remove the border
          obj.border = false;
        }
      }
    }else{
      if(obj.border){
        borderCount += 1;
        objectsWithBorders[index] = obj
      }
    }
    //if control is not pressed and someone clicked clear all borders
  }
  // if more than 1 object has a border create a muscle between the first two
  if(borderCount > 1){
    let objects = []
    for(const key in objectsWithBorders){
      let obj = objectsWithBorders[key]
      obj.border = false;
      objects.push([Number(key), obj])
    }
    sim.createMuscle(objects[0][1], objects[1][1], objects[0][0], objects[1][0])
  }
}
function viewMuscleProperties(event){
  let muscleButton = event.target;
  let muscleKey = Number(event.target.value);

  focusedElementIndex = muscleKey;

  sim.clearElementBorders();
  sim.updateElementBorder(muscleKey);

  let muscle = sim.getElement(muscleKey)

  let muscleWindow = document.getElementById("muscleGraphWindow");
  let muscleWindowHeaderText = document.getElementById("graphHeaderText");

  muscleWindowHeaderText.innerText = `Muscle${muscleKey}`;
  muscleWindow.classList.remove("hidden");
  muscleGraphClosed = false;

  for(let muscleCanvas of muscleGraphs){
    let xLabel = "Time(s)";
    let yLabel = "";
    let data = new ScrollingMap(0)
    switch(muscleCanvas.id){
      case "muscleForceGraph":
        yLabel = "Force(n)";
        data = muscle.forceData;
        break;
      case "muscleLengthGraph":
        yLabel = "Length(mm)";
        data = muscle.lengthData;
        break;
      case "muscleActivationGraph":
        yLabel = "Activation Level";
        data = muscle.activationData;
        break;
    }

    let graph = new Graph(muscleCanvas, 3, 0, 10, 0, 10, 10, xLabel, yLabel);
    graph.drawDotGraph(data, true);
  }

  // fill each canvas graph with points

}

function displayProperties(index, obj){
  propView.style.left = (mouseHoverX + window.scrollX) + "px";
  propView.style.top = (mouseHoverY + window.scrollY) + "px";
  let objInfo = "";
  let objInfoDict = obj.getObjectInfo();
  let len = 0;
  for(key in objInfoDict){
    len += 1;
    objInfo += `${key}: ${Math.round(objInfoDict[key] * 100)/100}\n`
  }

  //generate radio buttons for each connected muscle;

  let muscleIndicesSet = sim.connections.forwardGet(index);

  let modifier = ((muscleIndicesSet.size > 3) + 3);
  //0.75 accounts for line spacing changing it's size as the text gets bigger
  let height = (PropertyViewFontSize * len) + (PropertyViewFontSize * (muscleIndicesSet.size + 2) / modifier) + (0.75 *  len) + (1.0 * muscleIndicesSet.size);
  propView.style.height = height * scalingFactor;
  //set the innertext to the given properties
  propView.innerText = objInfo
  propView.padding = "5px";
  for(let key of muscleIndicesSet){

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'muscleRadioButton';
    input.value = key;
    input.id = `muscle${key}Selector`;
    input.classList.add( 'muscleGraphSelector');

    const label = document.createElement('label');
    label.classList.add('muscleRadioButtonLabel');
    label.appendChild(input);

    const labelText = document.createElement('span');
    labelText.classList.add("muscleLabelText");
    labelText.innerText = `m${key}`;
    label.appendChild(labelText);
    
    if(key === focusedElementIndex){
      input.checked = true;
    }
    label.addEventListener('change', viewMuscleProperties);

    propView.appendChild(label);
    
  }

  //display the properties
  propView.classList.remove("hidden");
}

function moveObject(object, cursorX, cursorY){
  let [graphX, graphY] = convertClientCoordsToGraph(cursorX, cursorY);


}
function checkHoverEvent(event){

  mouseHoverX = event.clientX;
  mouseHoverY = event.clientY;
  
  let [graphX, graphY] = convertClientCoordsToGraph(mouseHoverX, mouseHoverY)

  let assignMoveOnClick = false;

  let withinRect = false;
  for(let [index, obj] of sim.objects){

    if(isWithinRect(graphX, graphY, obj)){
      withinRect = true;
      if(inspection === true){
        displayProperties(index, obj);
      }else if(trash === true){

      }else if(move === true){
        if(sim.connections.forwardGet(index) !== undefined){
          
          canvas.style.cursor = "not-allowed";
        }else{
          assignMoveOnClick = true;

          canvas.style.cursor = "grabbing";
          //some function that allows a person to click the rect, which attaches the rect to the cursor
        }
      }else{

      }

      //make sure if the element is found the loop doesn't continue
      break;
    }else{
      if(!propView.classList.contains("hidden")){
        propView.classList.add("hidden")
      }
    }
  }
  // disable cursor not-allowed if you are no longer hovering over an element you can't move
  if(!withinRect && move){
    canvas.style.cursor = "";
  }
}
/**
 * Assign all events on mouseover
 */
function canvasEntered(){
  canvas.addEventListener('click', leftClickCanvas);
  canvas.addEventListener('mousemove', checkHoverEvent)
  
}
/**
 * Remove all events on mouseout
 */
function canvasLeave(){
  canvas.removeEventListener('click', leftClickCanvas);
  canvas.removeEventListener('mousemove', checkHoverEvent)
  
}
function clearAllControlBools(){
  inspection = false;
  trash = false;
  move = false;
  configure = false;
  canvas.style.cursor = ""; 
}
function inspectionClicked(event){
  checkboxClicked(event);
  inspection = event.target.checked;
  canvas.style.cursor =  inspection? "help": ""; 
}
function deleteClicked(event){
  checkboxClicked(event);
  trash = event.target.checked;
}
function moveClicked(event){
  checkboxClicked(event);
  move = event.target.checked;
  canvas.style.cursor = move? "grab": "";
}
function configureClicked(event){
  checkboxClicked(event);
  configure = event.target.checked;;
}

function checkboxClicked(e){
  clearAllControlBools();
  let targetId = e.target.id;
  let checkboxes = document.getElementsByClassName("controlCheckbox");
  for(let i = 0; i < checkboxes.length; i++){
    let checkbox = checkboxes[i];
    let id = checkbox.id;
    if(id != targetId){
      checkbox.checked = false;
    }
  }

}
function pauseButtonClicked(){
  let btn = document.getElementById("pausePlay");
  let btnRect = btn.getBoundingClientRect();
  let height = btnRect.height;
  if(btn.classList.contains("pause")){
    //css stuff
    btn.classList.remove("pause");
    btn.classList.add("play");
    btn.style.borderWidth = `${height/2}px 0px ${height/2}px ${height}px`;
    //sim stuff
    isPaused = false;
    totalPausedTime += (performance.now() - pauseStartTime)/1000;
  }
  else{
    //css stuff
    btn.classList.remove("play");
    btn.classList.add("pause");
    btn.style.borderWidth = `0px 0px 0px ${height/2}px`;
    //sim stuff
    isPaused = true;    
    pauseStartTime = performance.now();
  }
}
function setupInteractionEvents(){
  document.addEventListener("keydown", keyPressed);
  document.addEventListener("keyup", keyReleased);

  canvas.addEventListener('mouseover', canvasEntered);
  canvas.addEventListener('mouseout', canvasLeave);

  let controlCheckboxes = document.getElementsByClassName("controlCheckbox");
  let checkboxFunctions = {
    "move": moveClicked,
    "trash": deleteClicked,
    "inspect": inspectionClicked,
    "configure": configureClicked
  }
  for(let i = 0; i < controlCheckboxes.length; i++){
    let checkbox = controlCheckboxes[i];
    checkbox.addEventListener("change", checkboxFunctions[checkbox.id])
  }

  let pauseButton = document.getElementById("pausePlay")
  pauseButton.addEventListener("click", pauseButtonClicked);

  setUpMuscleGraphEvents();

}