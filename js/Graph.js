
//sets the graphing coordinate constraints
const maxX = 150;
const maxY = 150;

class Graph{
  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   * @param {Number} rawFontSize 
   * @param {Number} xMin 
   * @param {Number} xMax 
   * @param {Number} yMin 
   * @param {Number} yMax 
   * @param {Number} gridSpacing 
   * @param {String} xLabel 
   * @param {String} yLabel 
   */
  constructor(canvas, rawFontSize, xMin, xMax, yMin, yMax, numGridLines = 10, xLabel = "", yLabel = ""){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.xMin = xMin;
    this.xMax = xMax;

    this.yMin = yMin;
    this.yMax = yMax;

    this.yLabel = yLabel;
    this.xLabel = xLabel;

    this.gridSpacing = numGridLines;
    this.numGridLines = numGridLines;
  
    this.updateCanvasBoundingRect();
    this.setFontSize(rawFontSize);
    this.gridBounds = this.getGridBounds()
    this.setGridSpacing();
  }
  setGridSpacing(){
    console.log(this.xMax - this.xMin, this.yMax - this.yMin)
    this.gridSpacingX = (this.xMax - this.xMin) / this.numGridLines;
    this.gridSpacingY = (this.yMax - this.yMin) / this.numGridLines;
  }
  /**
   * @param {String} labelX 
   */
  setLabelX(labelX){
    this.labelX = labelX;
    this.setLabelMargin();
  }
  /**
   * @param {String} labelY 
   */
  setLabeLY(labelY){
    this.labelY = labelY
    this.setLabelMargin();
  }
  /**
   * Sets font size and then adjusts the margins to fit the size
   * @param {Number} rawFontSize 
   * @param {Number} scaleFactor 
   */
  setFontSize(rawFontSize, scaleFactor = scalingFactor){
    this.fontSize = rawFontSize * scaleFactor;
    this.ctx.font = this.fontSize + 'px Arial';
    this.setGridNumberingMargin()
    this.setLabelMargin();
    
  }
  /**
   * Updates the bounding rect for the canvas this graph corresponds with.
   */
  updateCanvasBoundingRect(){
    this.boundingRect = this.canvas.getBoundingClientRect();
    this.canvas.width = this.boundingRect.width;
    this.canvas.height = this.boundingRect.height;
  }
  setLabelMargin(){
    this.labelMarginLeft = this.yLabel.length != 0 ? this.fontSize: 0;
    this.labelMarginBottom = this.xLabel.length != 0 ? this.fontSize: 0;
  }
  setGridNumberingMargin(){
    /* If you want to place grid numbering on the outside of the y axis, do this:
      const measureY1 = ctx.measureText(String(this.yMin));
      const measureY2 = ctx.measureText(String(this.yMax));

      const widthY1 = measureY1.actualBoundingBoxLeft + measureY1.actualBoundingBoxRight;
      const widthY2 = measureY2.actualBoundingBoxLeft + measureY2.actualBoundingBoxRight;

      this.fontWidth = Math.max(widthY1, widthY2);
    */

    this.gridNumberingMarginLeft = this.fontSize;

    //for maintaining aspect ratio: = fontWidth. For reducing unused space: this.fontSize
    this.gridNumberingMarginBottom = this.fontSize;

  }
  /**
   * Creates an object that stores all the bounds of the grid in canvas coordinates. Object parameters are: left, right, top, bottom, width, and height
   * @returns Object bounds
   */
  getGridBounds(){
    let bounds = {
      left:0,
      right:0,
      top:0,
      bottom:0,
      width:0,
      height:0,
    }

    let marginLeft = this.labelMarginLeft + this.gridNumberingMarginLeft;
    let marginBottom = this.labelMarginBottom + this.gridNumberingMarginBottom;

    bounds.width = this.boundingRect.width - (marginLeft * 2);
    bounds.left = marginLeft;
    bounds.right = bounds.width + bounds.left;

    bounds.height = this.boundingRect.height - (marginBottom*2);
    bounds.top = marginBottom;
    bounds.bottom = bounds.height + bounds.top;

    return bounds;
  }
  /**
   * Linear mapping of x and y graphing coordinates to the grid coordinates. 
   * @param {Number} graphingX 
   * @param {Number} graphingY 
   * @returns 
   */
  graphToCanvasCoords(graphingX, graphingY){
    
    let canvasX = this.graphXToCanvasX(graphingX);
    let canvasY = this.graphYToCanvasY(graphingY);
    return [canvasX, canvasY]
  }
  /**
   * Standard linear mapping between graphingX and gridX(which is in canvas coordinates)
   */
  graphXToCanvasX(graphingX){
    return (this.gridBounds.width) * ((graphingX - this.xMin) / (this.xMax - this.xMin)) + this.gridBounds.left;
  }
  /**
   * Linear mapping between graphingY and gridY(in canvas) with y axis inversion to match the standard graph view
   */
  graphYToCanvasY(graphingY){
    let canvasY = (this.gridBounds.height) * ((graphingY - this.yMin) / (this.yMax - this.yMin));
    canvasY = this.gridBounds.bottom - canvasY;

    return canvasY;
  }
  drawCircle(canvasX, canvasY, radius){
    this.ctx.beginPath();
    this.ctx.arc(canvasX, canvasY, radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }
  /**
   * 
   * @param {ScrollingMap} pointsMap
   * @param {Boolean} resize 
   */
  drawDotGraph(pointsMap, resize = false){
    if(resize === true){
      this.yMin = null;
      this.yMax = null;
      this.xMin = null;
      this.xMax = null;
      for(let [time, value] of pointsMap){
        if(this.xMin === null){
          this.xMin = time;
          this.xMax = time;
          this.yMin = value;
          this.yMax = value;
        }

        this.xMin = Math.min(time, this.xMin);
        this.yMin = Math.min(value, this.yMin);
        this.xMax = Math.max(time, this.xMax);
        this.yMax = Math.max(value, this.yMax);
      }
      this.setGridSpacing();

    }
    for(let [time, value] of pointsMap){
      let[canvasX, canvasY] = this.graphToCanvasCoords(time, value);
      this.drawCircle(canvasX, canvasY, 3);
    }
    this.drawGrid();
  }
  /**
   * 
   * @param {FreeList} entityFreeList 
   */
  drawEntities(entityFreeList){

  }
  /**
   * 
   * @param {FreeList} muscleFreeList 
   */
  drawMuscles(muscleFreeList){

  }
  /**
   * 
   * @param {List} points
   */
  drawLineGraph(points){

  }
  

  /**
   * Draws the grid on the canvas without chaning canvas styling.
   */
  drawGrid(){
    this.ctx.beginPath();

    this.ctx.save();
    
    const gridNumberDisplacement = 2;

    //graph styling
    this.ctx.strokeStyle = '#a6a6a6';
    this.ctx.fillStyle = '#d1d1d1ff'
    this.ctx.font = `${this.fontSize}px Arial`
    this.ctx.lineWidth = 1;

    let xLinesDone = false;
    let yLinesDone = false;

    //to prevent the grid being drawn outside the bounds.
    let nextGraphingX = null
    let nextGraphingY = null;

    let i = 1;

    while(!(xLinesDone && yLinesDone)){
      if(!xLinesDone){
        this.ctx.beginPath();
        //generate grid coordiante
        
        if(nextGraphingX === null){
          nextGraphingX = i * this.gridSpacingX + this.xMin; 
        }
        const graphingXCoord = nextGraphingX;
        const canvasXCoord = this.graphXToCanvasX(nextGraphingX);;
        //alignment for the grid numbering
        

        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "top";


        //draw gridline
        this.ctx.moveTo(canvasXCoord, this.gridBounds.top);
        this.ctx.lineTo(canvasXCoord, this.gridBounds.bottom);
        this.ctx.stroke();
        //placing grid numbering text
        if(i!==0){
          let roundedX = Math.round(10 * graphingXCoord) / 10;
          let graphingCoordString = String(roundedX);
          this.ctx.fillText(graphingCoordString, canvasXCoord, this.gridBounds.bottom + gridNumberDisplacement);
        }

        nextGraphingX =  (i + 1) * this.gridSpacingX + this.xMin
        //set whether this is the last visible line
        xLinesDone = nextGraphingX >= this.xMax;
      }
      if(!yLinesDone){
        this.ctx.beginPath();
        //generate grid coordiante

        if(nextGraphingY === null){
          nextGraphingY = i * this.gridSpacingY + this.yMin; 
        }
        const graphingYCoord = nextGraphingY;
        const canvasYCoord = this.graphYToCanvasY(nextGraphingY);

        //alignment for grid numbering

        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "left";

        //draw gridline
        this.ctx.moveTo(this.gridBounds.left, canvasYCoord);
        this.ctx.lineTo(this.gridBounds.right, canvasYCoord);
        this.ctx.stroke();

        //placing grid numbering text
        if(i !== 0){
          let roundedY = Math.round(10 * graphingYCoord) / 10;
          let graphingCoordString = String(roundedY);
          this.ctx.fillText(graphingCoordString, this.gridBounds.left + gridNumberDisplacement, canvasYCoord);
        }

        //update the next graphing coord
        nextGraphingY = (i + 1) * this.gridSpacingY + this.yMin
        //set whether this is the last visible line
        yLinesDone = nextGraphingY >= this.yMax;
      }
      i++;  
    }
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#373737ff';
    // draw border around outside of the grid
    this.ctx.lineWidth = (gridNumberDisplacement * 2) - 1;
    //draw border around grid

    this.ctx.moveTo(this.gridBounds.left, this.gridBounds.top);
    this.ctx.lineTo(this.gridBounds.left, this.gridBounds.bottom);
    this.ctx.lineTo(this.gridBounds.right, this.gridBounds.bottom);
    this.ctx.lineTo(this.gridBounds.right, this.gridBounds.top);
    this.ctx.lineTo(this.gridBounds.left, this.gridBounds.top);
    this.ctx.stroke();
    //restore original context
    this.ctx.restore();
    //begin a new path to ensure this path is ignored
    //this.ctx.beginPath(); currently called at the beginning and end of draw labels so it's redundant to call it here, but keep this in case the approach changes.

    //draw labels
    this.drawLables();
  }
  drawLables(){
    this.ctx.beginPath();
    //draw labels
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";
    this.ctx.fillStyle = "rgb(47, 199, 85)";
    this.ctx.font = `bold ${this.fontSize}px Arial`
    
    //place x label on the very bottom of the canvas itself, but centered to the grid

    //since bottom = canvasHeight - marginSize and top = marginSize you can just do top + bottom to get canvasHeight, where the label needs to be placed.
    this.ctx.fillText(this.xLabel, this.gridBounds.left + (this.gridBounds.width / 2), this.gridBounds.top + this.gridBounds.bottom);

    //since this position is just 0 + fontSize set baseline to top and use x = 0;
    this.ctx.textBaseline = "top"
    
    //places origin at the label position
    this.ctx.translate(0, this.gridBounds.top + (this.gridBounds.height / 2));
    //rotates about that origin 90 degrees counterclockwise
    this.ctx.rotate(-Math.PI / 2);
    //places text at the newly set origin
    this.ctx.fillText(this.yLabel, 0, 0)

    //restore so the translation and rotation don't effect future canvases 

    this.ctx.restore();
    //begin a new path to ensure this path is ignored
    this.ctx.beginPath();

  }
  updateMinMax(pointsMap, keysArray = null){
    if(keysArray === null) keysArray = [...pointsMap.scrollingMap.keys()];

    let minKey = keysArray[0];
    let maxKey = keysArray[keysArray.length - 1];

    this.xMin = minKey;
    this.xMax = maxKey;

    this.yMin = pointsMap.get(keysArray[0]);
    this.yMax = pointsMap.get(keysArray[0]);
    for(let [key, value] of scrollingMap){
      this.yMin = Math.min(value, this.yMin);
      this.yMax = Math.max(value, this.yMax);  
    }
    return 1;

  }
  /**
   * Plots a series of points 
   * @param {ScrollingMap} pointsMap 
   */
  plotPoints(pointsMap, connectingLines = false, minMaxUpdated = false){
    //check

    this.ctx.save();

    let keysArray = [...pointsMap.scrollingMap.keys()];
    if(keysArray.length < 1) return;

    if(minMaxUpdated){
      this.updateMinMax(pointsMap, keysArray)
    }

    const radius = this.fontWidth;

    let [prevX, prevY] = null;
    for(let [key, value] of scrollingMap){
      const [canvasX, canvasY] = graphToCanvasCoords(key, value);
      //draw a circle at canvasX, canvasY
      this.ctx.arc(canvasX, canvasY, radius, 0, 2 * Math.PI, false);
      // if the user selects lines connecting each value and there is a previous point seen
      if(prevX !== null && connectingLines === true){
        this.ctx.moveTo(canvasX, canvasY);
        this.ctx.lineTo(prevX, prevY);
      }

      prevX = canvasX;
      prevY = canvasY; 
      
    }

    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore(); 
    
  }
}


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

function drawGrid(canvasCtx = ctx, canvasBoundingRect = canvasRect,
    rawFontSize = 4, gridSpacing = 10,
    xMin = 0, xMax = maxX, yMin = 0, yMax = maxX,
    xLabel = "", yLabel = ""){
  canvasCtx.strokeStyle = '#a6a6a6';
  canvasCtx.fillStyle = '#a6a6a6'

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