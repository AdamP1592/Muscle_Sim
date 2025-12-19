
const PropertyViewWidth = 30;
const PropertyViewHeight = 20;
const PropertyViewFontSize = 5;

//pre creates variables for all the main parts of the sim
var canvas = null;
var ctx = null;
var sim = null;
var scalingFactor = null;
var renderingScale = 1;
var startTime = 0;

//for client bounding rect
var canvasRect = null;


//Storage for maintaining the connection between dt and fps
var lastFrameTime = null;

//resizeEventStuff
var oldWidth = 0;
var oldHeight = 0;
var resizeTimeout;
var defaultScrollX = 0;
var defaultScrollY = 0;

function drawMuscles(){
  for(let [index, element] of sim.forceAddingElements){

    let obj1 = sim.objects.get(element.index1);
    let obj2 = sim.objects.get(element.index2);

    let [obj1X, obj1Y] = convertGraphCoordsToCanvas(obj1.x, obj1.y);
    let [obj2X, obj2Y] = convertGraphCoordsToCanvas(obj2.x, obj2.y);

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
    ctx.moveTo(obj1X + (canvasWidth1)/2, (obj1Y + (canvasHeight1)/2));
    ctx.lineTo(obj2X + (canvasWidth2)/2, obj2Y + (canvasHeight2)/2);

    ctx.stroke();

  }
}
function drawObjects(){
  ctx.beginPath();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for(let [index, obj] of sim.objects){


    ctx.fillStyle = obj.color;

    let canvasWidth = obj.width * scalingFactor;
    let canvasHeight = obj.height * scalingFactor;
    
    let [xCanvas, yCanvas] = convertGraphCoordsToCanvas(obj.x, obj.y)

    let topCornerX = xCanvas - (canvasWidth/2);
    let topCornerY = yCanvas - (canvasHeight/2);
    ctx.fillRect(topCornerX, topCornerY, canvasWidth , canvasHeight);
    ctx.fillStyle = '#76acadff';
    if(obj.border){
      ctx.strokeRect(topCornerX, topCornerY, canvasWidth, canvasHeight);
    }
    let fontSize =  String(5 * scalingFactor);
    ctx.font = fontSize + 'px bold arial'
    ctx.fillText(index, xCanvas, yCanvas)
    
  }
  ctx.fill();
  ctx.stroke();
}

// default is for the main graph but optional for the grid
function draw(currentTime){
  const fps = 60
  const dt = 0.0001
  let elapsedTime = currentTime - lastFrameTime;
  //dt is 1ms, there are 30 fps, elapsed time is 
  if(!isPaused){
    let currentTimeSeconds = currentTime/1000;
    let stepCount = Math.floor(((currentTimeSeconds - totalPausedTime) - sim.t)  / dt);
    //console.log(elapsedTime, stepCount)
    for(let i = 0; i < stepCount; i++){
      sim.step(dt);
    }
  }
  if (elapsedTime > 1000/fps){
    //every second
    // in case fps is low, the sim adjusts each subsequent number
    // of steps to fit real-time simulation
    
    // DEBUG: let stepCount = 1;
    //clear canvas
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    // draw grid
    drawGrid();
    // draw muscles
    drawMuscles();
    // draw rects
    drawObjects();
      
    // update sim 
    lastFrameTime = currentTime;
  }
  requestAnimationFrame(draw); 
}

function resizeCanvas(){
  let graphingFooter = document.getElementById("graphFooter");
  let interactions = document.getElementById("interactions");
  let navbar = document.getElementById("navBar");

  let main = document.getElementById("main");
  let body = document.getElementsByTagName("body")[0];
  let pauseButton = document.getElementById("pausePlay");
  //if canvas + interaction menu min width is > window width
  if(canvas.width + 100 > window.innerWidth){
    body.classList.add("noMargin");
    main.classList.add("justify-left");
    
  }else{
    main.classList.remove("justify-left")
    body.classList.remove("noMargin");
  }
  canvasRect = canvas.getBoundingClientRect();
  
  canvas.width = canvasRect.width;
  canvas.height = canvasRect.height;

  scalingFactor = canvasRect.width/maxX;

  //rescale st
  propView.style.width = (PropertyViewWidth * scalingFactor);
  propView.style.height = (PropertyViewHeight * scalingFactor);
  propView.style.fontSize = (PropertyViewFontSize * scalingFactor);

  let height = 3.5 * scalingFactor;
  pauseButton.style.height = height + "px";

  if(pauseButton.classList.contains("play")){
    pauseButton.style.borderWidth = `${height/2}px 0px ${height/2}px ${height}px`;
  }else{
    pauseButton.style.borderWidth = `0px 0px 0px ${height/2}px`
  }

  let interactionRect = interactions.getBoundingClientRect()


  footerWidth = interactionRect.width + canvasRect.width
  graphingFooter.style.width = footerWidth + "px";
  //graphingFooter.style.top = Math.max(0, canvasRect.bottom) + "px";
  graphingFooter.style.height = 5.5 * scalingFactor;
  navbar.style.paddingRight = `calc(max(${footerWidth}px, 100%) - 100%)`
  //let spawnButtons = document.getElementsByClassName("spawn_button");
  
}
/**
 * sets up the first demo visualization of the simulation(a cube following a circular motion)
 */
function demo1(){
  //create objects
  sim.createMoveableSquare(50, 50);//obj0
  sim.createFixedSquare(30, 30); //obj1
  sim.createFixedSquare(21.715729, 50)//obj2
  sim.createFixedSquare(30, 70)//obj3
  sim.createFixedSquare(78.284271, 50)//obj4
  sim.createFixedSquare(50, 78.284271)//obj5
  sim.createFixedSquare(70, 70)//obj6
  sim.createFixedSquare(70, 30)//obj7
  sim.createFixedSquare(50, 21.715729)//obj8

  let numFixed = 8;
  
  let freq = 1;
  // creates once muscle for each fixed object
  // shifts the activation pattern so that each muscle is activated freq
  // times a second and their activation peaks are evenly spaced across the full
  // stimulation cycle
  for(let i = 1; i <= numFixed; i++){
    console.log(`Creating muscle connecting(0, ${i})`)
    sim.createMuscle(sim.objects.get(0), sim.objects.get(i), 0, i)

    let shift = ((i - 1) / numFixed) * (1/freq);
    sim.forceAddingElements.get(i - 1).muscle.setStimulation(shift, "sin", freq)
  }
  
}

//window events
  window.addEventListener("resize", () => {
    requestAnimationFrame(resizeCanvas)
  });

window.addEventListener("load", function() {
  sim = new PhysicsSim();
  demo1();

  defaultScrollX = window.scrollX;
  defaultScrollY = window.scrollY;

  propView = document.getElementById("propertyView");

  canvas = document.getElementById("phys_sim");
  canvasRect = canvas.getBoundingClientRect();

  ctx = canvas.getContext("2d");

  setupInteractionEvents()

  create_onclick_events();
  lastFrameTime = performance.now();

  //call resize twice.
  //first sets the initial state, and might apply a flexbox alignment
  //second calls after t

  canvas.width = canvasRect.width;
  canvas.height = canvasRect.height;

  resizeCanvas();

  startTime = performance.now()
  requestAnimationFrame(draw);
});
