//sets the graphing coordinate constraints
const maxX = 150;
const maxY = 150;

/**
 * 
 * @param {CanvasRenderingContext2D} canvasCtx 
 * @param {DOMRect} canvasBoundingRect 
 * @param {Number} rawFontSize 
 * @param {Number} gridSpacing 
 * @param {Number} xMin 
 * @param {Number} xMax 
 */
function drawGrid(canvasCtx = ctx, canvasBoundingRect = canvasRect, rawFontSize = 4, gridSpacing = 10,  xMin = 0, xMax = maxX){
  canvasCtx.strokeStyle = '#a6a6a6';
  canvasCtx.fillStyle = '#a6a6a6'

  canvasCtx.textAlign = "left";
  canvasCtx.textBaseline = "bottom";

  let fontSize =  String(rawFontSize * scalingFactor);
  canvasCtx.font = fontSize + 'px bold arial'
  canvasCtx.lineWidth = 1;

  for(let i = (xMin/gridSpacing) ; i < Math.round((xMax + xMin) / gridSpacing); i++){
    canvasCtx.beginPath();
    //move to some incriment of 10 in graph coords 
    let graphingCoord = (i - (xMin/gridSpacing)) * gridSpacing;

    //scales scaling factor to fit whatever xMax is since 150 is the default
    let canvasCoord = graphingCoord * (scalingFactor * (maxX/xMax));

    let graphingCoordString = String(i * gridSpacing);

    //so the numbers arent exactly on the lines
    let coordDisplacement = 3;

    //draw x lines
    canvasCtx.fillText(graphingCoordString, canvasCoord + coordDisplacement, canvasBoundingRect.height);
    canvasCtx.moveTo(canvasCoord, 0);
    canvasCtx.lineTo(canvasCoord, canvasBoundingRect.height);
    canvasCtx.stroke();
    
    //draw y lines
    canvasCtx.fillText(graphingCoordString, coordDisplacement, canvasBoundingRect.height - canvasCoord);
    canvasCtx.moveTo(0, canvasCoord);
    canvasCtx.lineTo(canvasRect.width, canvasCoord);
    canvasCtx.stroke();
  }
  
}
/**
 * Takes in x and y in graphing coordinates.
 * Checks if those graphing coordinates fall within the given rect
 * @param {Number} x 
 * @param {Number} y 
 * @param {elementRect} rect 
 * @param {String} positioning 
 */

function isWithinRect(x, y, rect, positioning="centered"){
  // IF ANYTHING IS POSITIONED IN A DIFFERENT WAY(eg. bottomright) ADD THEM HERE
  let leftSide = rect.x;
  let topSide = rect.y;

  let rightSide = rect.x + rect.width;
  let bottomSide = rect.y + rect.height;
  
  if(positioning === "centered"){

    let widthDisplacement = rect.width * 0.5;
    let heightDisplacement = rect.height * 0.5;

    leftSide -= widthDisplacement;
    topSide -= heightDisplacement;

    rightSide -= widthDisplacement;
    bottomSide -= heightDisplacement;

  }

  return (x > leftSide && x < rightSide) && (y > topSide  && y < bottomSide)
}
/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {DOMRectReadOnly} rect
 * @param {Boolean} debug
 * @returns 
 */
function convertClientCoordsToGraph(x, y, rect = canvasRect, debug = false){

  x += window.scrollX;
  y += window.scrollY;
  // For some reason when the page loads with a default x offset, client.bounding
  // rect gives a negative value for something you can actually scroll to, even
  // if I get the bounding rect in this function

  /* This is technically how you can resolve it, but it's more efficient to just clamp
  if(rect.left == -window.scrollX && window.scrollX != 0){
    x -= window.scrollX
  }
  if(rect.top == -window.scrollY && window.scrollY != 0){
    y -= window.scrollY;
  }
  */
  const canvasX = x - Math.max(0, canvasRect.left);
  const canvasY = rect.width - (y - Math.max(0, rect.top));
  const graphX = canvasX / scalingFactor;
  const graphY = canvasY / scalingFactor;
  if(debug){
    console.log(`
    x: ${Math.round(x)}, y:${Math.round(y)}
    ScrollX: ${window.scrollX}, ScrollY:${window.scrollY}
    CanvasX: ${canvasX}, CanvasY:${canvasY}
    GraphX: ${graphX}, GraphY: ${graphY}
    RectLeft: ${rect.left}, RectTop:${rect.top}
    `);
    console.log(rect)
  }

  return [graphX, graphY]
}
/**
 * converts graphing x and y to canvas coords
 * @param {Number} x 
 * @param {Number} y 
 * @returns 
 */
function convertGraphCoordsToCanvas(
    x, y, 
    xMin = 0, xMax = maxX,
    yMin = 0, yMax = maxY,
    canvasWidth = canvasRect.width, canvasHeight = canvasRect.height)
    {
    //converts 0 - maxX/maxY coords to canvas coords

    let xNormalized = (x - xMin) / (xMax - xMin);
    let yNormalized = (y - yMin) / (yMax - yMin);
    
    let xCanvas = xNormalized * canvasWidth;
    let yCanvas = canvasHeight - (yNormalized * canvasHeight);

    return [xCanvas, yCanvas]
}
function create_onclick_events(){
    let buttons = document.getElementsByClassName("spawn_button");
    //create all spawn button events
    for (let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener("mousedown", onclick_event)
    }
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} scrollingMap 
 */
function drawLineGraph(ctx, scrollingMap){
    let radius = 1;

    let previousPoint = null;
    for([key, value] of scrollingMap){
        let [xCanvas, yCanvas] = convertGraphCoordsToCanvas(x, y)

        ctx.arc(xCanvas, yCanvas, radius, 0, 2 * Math.PI);

        if(previousPoint){
            ctx.beginPath();
            ctx.moveTo(xCanvas, yCanvas);
            ctx.lineTo(previousPoint[0], previousPoint[1]);
        }

        previousPoint = [xCanvas, yCanvas];

    }

}