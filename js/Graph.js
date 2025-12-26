

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
 * @param {Number} yMin
 * @param {Number} yMax
 */

function getGridRect(canvasWidth, canvasHeight, labelPaddingX, labelPaddingY, rawFontSize){

} 
function convertCanvasToGrid(){

}
function convertGridToGraph(){

}
function convertGraphToCanvas(){
  
}

function drawGrid(canvasCtx = ctx, canvasBoundingRect = canvasRect,
    rawFontSize = 4, gridSpacing = 10,
    xMin = 0, xMax = maxX, yMin = 0, yMax = maxX,
    xLabel = "", yLabel = ""){
  canvasCtx.strokeStyle = '#a6a6a6';
  canvasCtx.fillStyle = '#a6a6a6'

  canvasCtx.textAlign = "left";
  canvasCtx.textBaseline = "bottom";

  let fontSize =  rawFontSize * scalingFactor;
  canvasCtx.font = fontSize + 'px bold arial'


  let lineWidth = 1;
  canvasCtx.lineWidth = lineWidth;


  canvasCtx.beginPath();
  let xLinesDone = false;
  let yLinesDone = false;

  const y1 = String(yMin);
  const y2 = String(yMax);

  const widthY1 = ctx.measureText(y1).width;
  const widthY2 = ctx.measureText(y2).width;

  const fontWidth = Math.max(widthY1, widthY2);

  //left is the fontSize(height) of the text + the fontWidth for the grid
  const gridLeft = fontSize + fontWidth;
  const gridRight = canvasBoundingRect.width - (fontSize + fontWidth);
  

  //top, since both label and grid numbering are on the same axis, it's just adjusting for label being below the grid numbering
  const gridTop = (fontSize * 2);
  const gridBottom = canvasBoundingRect.height - (fontSize * 2);


  let i = 0;
  
  while(!(xLinesDone && yLinesDone)){
    if(!xLinesDone){
      canvasCtx.textAlign = "center";
      canvasCtx.textBaseline = "top";
      let graphingXCoord = (i * gridSpacing) + xMin;

      //scales x to match the grid width(aka canvas width - label displacement). Adds label displacement so the x grid is shifted to the right of the label
      let canvasXCoord = (gridRight - gridLeft) * ((graphingXCoord - xMin) / (xMax - xMin)) + gridLeft;
      let graphingCoordString = String(graphingXCoord);


      //draw gridline
      canvasCtx.moveTo(canvasXCoord, gridTop);
      canvasCtx.lineTo(canvasXCoord, gridBottom);
      //draw text with arbitrary displacement(so text doesn't directly line up with line)
      

      //set whether this is the last visible line
      xLinesDone = graphingXCoord >= xMax;

      //draw labels for all grid lines that aren't

      canvasCtx.fillText(graphingCoordString, canvasXCoord, gridBottom);
      
    }
    if(!yLinesDone){
      canvasCtx.textBaseline = "middle";
      canvasCtx.textAlign = "right";
      let graphingYCoord = (i * gridSpacing) + yMin;
      //standard linear transformation would be (gridBottom - gridTop) * (y - yMin)/(yMax - yMin), but the coord has to be inverted too, so it's gridBottom - canvasY
      let canvasYCoord = (gridBottom - gridTop) * ((graphingYCoord - yMin) / (yMax - yMin));
      canvasYCoord = gridBottom - canvasYCoord

      let graphingCoordString = String(graphingYCoord);

      //draw gridline from x = labelDisplacement to the edge of the canvas
      canvasCtx.moveTo(gridLeft, canvasYCoord);
      canvasCtx.lineTo(gridRight, canvasYCoord);

      //draw text with arbitrary displacement(so text doesn't directly line up with line)

      //set whether this is the last visible line
      yLinesDone = graphingYCoord >= yMax;

      canvasCtx.fillText(graphingCoordString, gridLeft, canvasYCoord);
    
    }
    i++;  
  }

  //draw labels
  canvasCtx.save();
  canvasCtx.textAlign = "center";
  
  //place x label on bottom edge of canvas
  canvasCtx.fillText(xLabel, (fontSize + (canvasBoundingRect.width - fontSize) / 2), canvasBoundingRect.height );
  canvasCtx.textBaseline = "top"
  
  //place y label on top edge of canvas
  canvasCtx.translate(0, fontSize + (canvasBoundingRect.height - fontWidth) / 2);
  canvasCtx.rotate(-Math.PI / 2);
  canvasCtx.fillText(yLabel, 0, 0)

  //restore so the rest of the rendering can happen
  canvasCtx.restore()
  canvasCtx.stroke();
  canvasCtx.fill()
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