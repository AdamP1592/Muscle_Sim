//sets the graphing coordinate constraints
const maxX = 100;
const maxY = 100;
//pre creates variables for all the main parts of the sim
var focused_button = null;
var canvas = null;
var ctx = null;
var sim = null;
var scalingFactor = null;

//for ctrl + (key) events
var controlPressed = false;

//for client bounding rect
var rect = null;

//Storage for maintaining the connection between dt and fps
var lastFrameTime = null;

//resizeEventStuff
var oldWidth = 0;
var oldHeight = 0;

function create_onclick_events(){
    let buttons = document.getElementsByClassName("spawn_button");
    //create all spawn button events
    for (let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener("mousedown", onclick_event)
    }
}
/**
 * if a click is released, place the object that corresponds with the button that was pressed
 * @param {*} event 
 */
function click_released(event){
  
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  //scaled to between 0 to maxX/maxY 
  let xScaled = maxX * (x / rect.width);
  let yScaled = maxY * (y / rect.height);

  //in bounds
  if(!( x < 0 || y < 0 || x > rect.width || y > rect.height)){

    switch(buttonID){
      case "fixed_spawn":
        sim.createFixedSquare(xScaled, yScaled)
        break;
      case "move_spawn":
        sim.createMoveableSquare(xScaled, yScaled)
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

function convertRawCoordsToCanvas(x, y){
  //converts 0 - maxX/maxY coords to canvas coords
  let xCanvas = x * rect.width / maxX
  let yCanvas = y * rect.height / maxY

  return [xCanvas, yCanvas]
}
function drawMuscles(){
  for(let i = 0; i < sim.forceAddingElements.length; i++){
    let element = sim.forceAddingElements[i];

    let obj1 = sim.objects[element.index1];
    let obj2 = sim.objects[element.index2];

    let [obj1X, obj1Y] = convertRawCoordsToCanvas(obj1.x, obj1.y);
    let [obj2X, obj2Y] = convertRawCoordsToCanvas(obj2.x, obj2.y);

    let canvasWidth1 = obj1.width * scalingFactor
    let canvasHeight1 = obj1.height * scalingFactor
    let canvasWidth2 = obj2.width * scalingFactor
    let canvasHeight2 = obj2.height * scalingFactor

    obj1X -= canvasWidth1/2;
    obj1Y -= canvasHeight1/2;

    obj2X -= canvasWidth2/2;
    obj2Y -= canvasHeight2/2;

    ctx.beginPath();
    ctx.strokeStyle = '#c21212ff';
    ctx.lineWidth = 3
    ctx.moveTo(obj1X + (canvasWidth1)/2, obj1Y + (canvasHeight1)/2);
    ctx.lineTo(obj2X + (canvasWidth2)/2, obj2Y + (canvasHeight2)/2);

    ctx.stroke();

  }
}
function drawSquares(){
  ctx.beginPath();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for(let i = 0; i < sim.objects.length; i++){

    let obj = sim.objects[i];

    ctx.fillStyle = obj.color;

    let canvasWidth = obj.width * scalingFactor;
    let canvasHeight = obj.height * scalingFactor;
    
    let [xCanvas, yCanvas] = convertRawCoordsToCanvas(obj.x, obj.y)

    let topCornerX = xCanvas - (canvasWidth/2);
    let topCornerY = yCanvas - (canvasHeight/2);
    ctx.fillRect(topCornerX, topCornerY, canvasWidth , canvasHeight);
    ctx.fillStyle = '#76acadff';
    if(obj.border){
      ctx.strokeRect(topCornerX, topCornerY, canvasWidth, canvasHeight);
    }
    let fontSize =  String(5 * scalingFactor);
    ctx.font = fontSize + 'px bold arial'
    ctx.fillText(i, xCanvas , yCanvas )
    
  }
  ctx.fill();
  ctx.stroke();
}

function draw(currentTime){
  const fps = 30
  const dt = 0.001
  let elapsedTime = currentTime - lastFrameTime;
  //dt is 1ms, there are 30 fps, elapsed time is 
  
  if (elapsedTime > 1000/fps){
    // in case fps is low, the sim adjusts each subsequent number
    // of steps to fit real-time simulation
    let stepCount = Math.round(elapsedTime / ( 1000 * dt ));
    // DEBUG: let stepCount = 1;
    //clear canvas
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    // draw muscles
    drawMuscles();

    // draw rects

    drawSquares();

    // update sim 
    //console.log(sim.t)
    for(let i = 0; i < stepCount; i++){
      //console.log(sim.t)
      sim.step(dt);
    }
    
    lastFrameTime = currentTime - (elapsedTime % (1000/fps));
    
  }
  requestAnimationFrame(draw); 
}

function resizeCanvas(){
  rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  scalingFactor = rect.width/150;
  oldWidth = canvas.width;
  oldHeight = canvas.height;
  
}
window.addEventListener("load", function() {
  sim = new PhysicsSim();
  demo1();

  canvas = document.getElementById("phys_sim");
  ctx = canvas.getContext("2d");

  canvas.addEventListener('click', leftClickCanvas);

  create_onclick_events();
  lastFrameTime = performance.now();
  resizeCanvas();
  requestAnimationFrame(draw);
});
/**
 * sets up the first demo visualization of the simulation
 */
function demo1(){
  //create objects
  sim.createMoveableSquare(40, 40);//obj0
  sim.createFixedSquare(60, 60); //obj1
  sim.createFixedSquare(60, 20)//obj2
  sim.createFixedSquare(20, 60)//obj3
  sim.createFixedSquare(20, 20)//obj4
  
  //create muscles
  sim.createMuscle(sim.objects[0], sim.objects[1], 0, 1)//m0
  sim.createMuscle(sim.objects[0], sim.objects[2], 0, 2)//m1
  sim.createMuscle(sim.objects[0], sim.objects[3], 0, 3)//m2
  sim.createMuscle(sim.objects[0], sim.objects[4], 0, 4)//m3


  sim.forceAddingElements[0].muscle.setStimulation(0, "sin", 1)
  sim.forceAddingElements[1].muscle.setStimulation(0.25, "sin", 1)
  sim.forceAddingElements[2].muscle.setStimulation(0.5, "sin", 1)
  sim.forceAddingElements[2].muscle.setStimulation(0.75, "sin", 1)
  
}

function keyPressed(event){
  if(event.key === "Control"){
    controlPressed = true;
  }
  if(event.key === "Space"){
    sleep(1000);
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

  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;
  
  let borderCount = 0;
  //to prevent having to index a list
  let objectsWithBorders = {};

  for(let i = 0; i < sim.objects.length; i++){
    let obj = sim.objects[i];
    let [canvasX, canvasY] = convertRawCoordsToCanvas(obj.x, obj.y);
    
    let width = obj.width * scalingFactor;
    let height = obj.height * scalingFactor;

    if(controlPressed){
      //if there was a square that got clicked
      if (mouseX >= canvasX && mouseX <= canvasX + width &&
          mouseY >= canvasY && mouseY <= canvasY + height) {
          //if it hasn't been clicked yet, add it to the list of clicked
          if(obj.border == false){
            obj.border = true;
            objectsWithBorders[i] = obj;
            borderCount += 1;
          }else{
            //if it has been clicked, remove the border
            obj.border = false;
          }
      }
      else{
        //if there is a border on a square and it wasn't clicked
        if(obj.border){
          objectsWithBorders[i] = obj;
          borderCount += 1;
        }
      }
    }
    //if control is not pressed and someone clicked clear all borders
    else{
      obj.border = false;
    }
  }
  // if more than 1 object has a border create a muscle between the first two
  if(borderCount > 1){
    let objects = []
    for(const key in objectsWithBorders){
      let obj = objectsWithBorders[key]
      obj.border = false;
      objects.push([key, obj])
    }
    sim.createMuscle(objects[0][1], objects[1][1], objects[0][0], objects[1][0])
  }
}

//window events
window.addEventListener("resize", resizeCanvas)

//key events
document.addEventListener("keydown", keyPressed);
document.addEventListener("keyup", keyReleased);