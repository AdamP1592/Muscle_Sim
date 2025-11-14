
var focused_button = null;
var canvas = null;
var ctx = null;
var sim = null;
var scalingFactor = null;

var rect = null;

var lastFrameTime = null;

var oldWidth = 0;
var oldHeight = 0;

function create_onclick_events(){
    let buttons = document.getElementsByClassName("spawn_button");
    //console.log(buttons)
    for (let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener("mousedown", onclick_event)
    }
}
function onclick_event(event){
  //console.log("Clicked", event.srcElement)
  button = event.srcElement
  buttonID = event.srcElement.id
  document.addEventListener('mouseup', click_released);

  let main = document.getElementById("main");
  main.classList.add('hover_with_obj');
  
  function click_released(event){
    
    //gets coords of rect

    console.log(`Event ${event}.\nRect: ${rect}`)

    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    //scaled to between 0 to 250 
    let xScaled = 250 * (x / rect.width);
    let yScaled = 250 * (y / rect.height);
    console.log(`RawXY: ${x}, ${y} \nScaledXY(0 - 250) ${xScaled}, ${yScaled}`)

    //in bounds
    if(!( x < 0 || y < 0 || x > rect.width || y > rect.height)){

      switch(buttonID){
        case "fixed_spawn":
          console.log("Button ID: ", buttonID);
          sim.createFixedSquare(xScaled, yScaled)
          break;
        case "move_spawn":
          sim.createMoveableSquare(xScaled, yScaled)
          break;
        case "fiber_spawn":
          break;
      }
    }
    else{
      console.log("Out of bounds")
    }
    let main = document.getElementById("main")
    main.classList.remove('hover_with_obj');
    document.removeEventListener('mouseup', click_released)
  } 

}

function convertRawCoordsToCanvas(x, y){
  //converts 0 - 250 coords to canvas coords
  let xCanvas = x * rect.width / 250
  let yCanvas = y * rect.height / 250

  return [xCanvas, yCanvas]
}
function drawSquares(){
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for(let i = 0; i < sim.objects.length; i++){
    ctx.fillStyle = '#575757';
    if(sim.objects[i] instanceof MoveableRect){
      ctx.fillStyle = '#a72525ff'
    }

    let obj = sim.objects[i];

    let canvasWidth = obj.width * scalingFactor;
    let canvasHeight = obj.height * scalingFactor;
    
    let [xCanvas, yCanvas] = convertRawCoordsToCanvas(obj.x, obj.y)
    //console.log("Scaled to fit current canvas:");
    //console.log(`CanvasXY: (${yCanvas}, ${yCanvas})`)

    ctx.fillRect(xCanvas, yCanvas, canvasWidth , canvasHeight);

    ctx.fillStyle = '#76acadff';

    let fontSize =  String(5 * scalingFactor);
    ctx.font = fontSize + 'px bold arial'
    ctx.fillText(i, xCanvas + canvasWidth/2, yCanvas + canvasHeight/2)
    
  }
}

function draw(currentTime){
  const fps = 30
  let elapsedTime = currentTime - lastFrameTime;
  //1000 ms per second
  if (elapsedTime > 1000/fps){

    //start a new path so the old frame gets cleared
    ctx.beginPath();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lastFrameTime = currentTime - (elapsedTime % (1000/fps));
    //draw all the stuff from the sim

    drawSquares();
    ctx.fill();
    ctx.stroke();
    
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
  canvas = document.getElementById("phys_sim");
  ctx = canvas.getContext("2d");
  create_onclick_events();
  lastFrameTime = performance.now();
  resizeCanvas();
  requestAnimationFrame(draw);


  
});
window.addEventListener("resize", resizeCanvas)
