
const PropertyViewWidth = 30;
const PropertyViewHeight = 20;
const PropertyViewFontSize = 5;
//pre creates variables for all the main parts of the sim
var canvas = null;

var mainGraph = null;
var muscleGraphs = [];

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

    let [obj1X, obj1Y] = mainGraph.clientCoordsToGraphing(obj1.x, obj1.y);
    let [obj2X, obj2Y] = mainGraph.clientCoordsToGraphing(obj2.x, obj2.y);

    const canvasWidth1 = obj1.width * scalingFactor
    const canvasHeight1 = obj1.height * scalingFactor
    const canvasWidth2 = obj2.width * scalingFactor
    const canvasHeight2 = obj2.height * scalingFactor

    obj1X -= canvasWidth1/2;
    obj1Y -= canvasHeight1/2;

    obj2X -= canvasWidth2/2;
    obj2Y -= canvasHeight2/2;

    const startX = obj1X + (canvasWidth1)/2;
    const endX = obj2X + (canvasWidth2)/2;

    const startY = obj1Y + (canvasHeight1)/2;
    const endY =  obj2Y + (canvasHeight2)/2;

    if(element.border === true){
      ctx.beginPath();
      ctx.strokeStyle = element.borderColor;
      ctx.lineWidth = 8;
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = '#c21212ff';
    ctx.lineWidth = 3
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

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
    
    let [xCanvas, yCanvas] = mainGraph.clientCoordsToGraphing(obj.x, obj.y)

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
  const fps = 60;
  const dt = 0.0005
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
    mainGraph.drawMap(sim.forceAddingElements, sim.objects, scalingFactor)

    if(muscleGraphs.length !== 0){
      for(let graphObject of muscleGraphs){
        let data = graphObject.data;
        let graph = graphObject.graph;
        graph.drawLineGraph(data, true);
      }
    }
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
  if(mainGraph instanceof Graph){
    mainGraph.updateSizing();
  }
  
  //rescale property view
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

//window events
  window.addEventListener("resize", () => {
    requestAnimationFrame(resizeCanvas)
  });

window.addEventListener("load", function() {
  sim = new PhysicsSim();
  // run some demo
  demo1();

  defaultScrollX = window.scrollX;
  defaultScrollY = window.scrollY;

  propView = document.getElementById("propertyView");

  canvas = document.getElementById("phys_sim");

  canvasRect = canvas.getBoundingClientRect();

  ctx = canvas.getContext("2d");


  setupInteractionEvents()

  create_onclick_events();
  

  canvas.width = canvasRect.width;
  canvas.height = canvasRect.height;

  resizeCanvas();
  mainGraph = new Graph(canvas, 4, 0, maxX, 0, maxY, 15)
  
  lastFrameTime = performance.now();
  startTime = performance.now()
  requestAnimationFrame(draw);
});
