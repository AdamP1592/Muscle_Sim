
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

    this.rawFontSize = rawFontSize;

    this.gridSpacing = 0;
    this.numGridLines = numGridLines;
    console.log(rawFontSize)
    this.updateCanvasBoundingRect();
    this.setFontSize(rawFontSize);
    this.gridBounds = this.getGridBounds()
    this.setGridSpacing();
  }
  /* --------BUILD FUNCTIONS-------- */
  setGridSpacing(){

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
  updateSizing(){
    this.updateCanvasBoundingRect();
    this.setFontSize(this.rawFontSize);
    this.gridBounds = this.getGridBounds();
    this.setGridSpacing();
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
    console.log(this.fontSize)
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

  updateMinMax(pointsMap){
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
  /* --------BUILD FUNCTIONS END-------- */
  
  /* --------COORDINATE CONVERSION FUNCTIONS-------- */
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
  /**
   * Function that converts client coords to canvas coords
   * @param {Number} clientX 
   * @returns The canvas coordinate clientX corresponds to
   */
  clientXToCanvasX(clientX){
    const canvasX = clientX - this.boundingRect.left;
    return canvasX;
  }
  /**
   * Function that converts client coords to canvas coords
   * @param {Number} clientY 
   * @returns The canvas coordinate clientY corresponds to
   */
  clientYToCanvasY(clientY){
    const canvasY = clientY - this.boundingRect.top;
    return canvasY;
  }
  /**
   * Function that converts canvas coords to the graphing coords, automatically adjusting to the grid displayed
   * @param {Number} canvasX 
   * @returns The graphing coordiante canvasX corresponds to
   */
  canvasXToGraphingX(canvasX){
    return ((canvasX - this.gridBounds.left) * ( this.xMax - this.xMin) / this.gridBounds.width) + this.xMin
  }
  /**
   * Function that converts canvas coords to the graphing coords, automatically adjusting to the grid displayed
   * @param {Number} canvasY
   * @returns The graphing coordiante
   */
  canvasYToGraphingY(canvasY){
    return ((canvasY - this.gridBounds.bottom) * (this.yMax - this.yMin) / ( -this.gridBounds.height)) + this.yMin
  }
  /**
   * Converts from client coords to graphing coords, adjusting for the grid displacement
   * @param {Number} clientX 
   * @param {Number} clientY 
   * @returns Graphing coordinates
   */
  clientCoordsToGraphing(clientX, clientY){
    const canvasX = this.clientXToCanvasX(clientX);
    const canvasY = this.clientYToCanvasY(clientY);

    const graphingX = this.canvasXToGraphingX(canvasX);
    const graphingY = this.canvasYToGraphingY(canvasY);
     
    return [graphingX, graphingY]
  }
  /* --------COORDINATE CONVERSION FUNCTIONS END-------- */

  /* --------DRAW FUNCTIONS-------- */
  clearGraph(){
    this.ctx.clearRect(0, 0, this.boundingRect.width, this.boundingRect.height);
  }
    /**
   * 
   * @param {FreeList} entityFreeList
   * @param {Boolean} centered
   * @param {Number} scalingFactor
   */
  drawEntities(entityFreeList, centered = true, scalingFactor = 1){
    const fontSize = 5 * scalingFactor;
    for(let [index, entity] of entityFreeList){

      const graphX = entity.x;
      const graphY = entity.y;

      const [canvasX, canvasY] = this.graphToCanvasCoords(graphX, graphY);

      const width = entity.width * scalingFactor;
      const height = entity.height * scalingFactor;

      const borderColor = entity.borderColor;
      const fillColor = entity.color;

      const borderSize = entity.border ? entity.borderSize: 0;

      this.drawRect(canvasX, canvasY, width, height, fillColor, String(index), fontSize, borderSize, borderColor, centered);
    }
  }

  /**
   * 
   * @param {FreeList} muscleFreeList 
   * @param {FreeList} entityFreeList
   * @param {Boolean} centerep-
   */
  drawMuscles(muscleFreeList, entityFreeList, centered = true){
    for(let [index, element] of muscleFreeList){
      const obj1 = entityFreeList.get(element.index1);
      const obj2 = entityFreeList.get(element.index2);

      let [canvasX1, canvasY1] = this.graphToCanvasCoords(obj1.x, obj1.y);
      let [canvasX2, canvasY2] = this.graphToCanvasCoords(obj2.x, obj2.y);

      if(centered){
        canvasX1 -= (obj1.width / 2);
        canvasY1 -= (obj1.height / 2);
        canvasX2 -= (obj2.width / 2);
        canvasY2 -= (obj2.height /2)
      }
      
      if(element.border === true){
        this.drawLine(canvasX1, canvasY1, canvasX2, canvasY2, element.borderColor, 8);
      }
      this.drawLine(canvasX1, canvasY1, canvasX2, canvasY2, element.color, 3);
    }
  }
  /**
   * 
   * @param {Number} canvasX1 
   * @param {Number} canvasY1 
   * @param {Number} canvasX2 
   * @param {Number} canvasY2 
   * @param {String} color 
   * @param {Number} lineWidth 
   */
  drawLine(canvasX1, canvasY1, canvasX2, canvasY2, color, lineWidth = 1){
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.moveTo(canvasX1, canvasY1);
    this.ctx.lineTo(canvasX2, canvasY2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawFilledCircle(canvasX, canvasY, radius){
    this.ctx.beginPath();
    this.ctx.arc(canvasX, canvasY, radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }
  /**
   * 
   * @param {Number} canvasX 
   * @param {Number} canvasY 
   * @param {Number} width 
   * @param {Number} height 
   * @param {String} fillColor 
   * @param {String} text 
   * @param {Number} fontSize 
   * @param {Number} borderSize 
   * @param {String} borderColor 
   * @param {Boolean} centered 
   */
  drawRect(canvasX, canvasY, width, height, fillColor,
          text = "", fontSize = 0, borderSize = 0, borderColor="", centered = true){
    var left = canvasX;
    var top = canvasY;
    if(centered){
      left = canvasX - (width / 2);
      top = canvasY - (height /2);
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
    }
    
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderSize;

    this.ctx.fillRect(left, top, width, height);
    if(borderSize > 0) this.ctx.strokeRect(left, top, width, height);

    this.ctx.fillStyle = '#76acadff'
    this.ctx.font = `${fontSize}px arial`
    this.ctx.fillText(text, canvasX, canvasY);

    this.ctx.restore()
  }
  /**
   * 
   * @param {ScrollingMap} pointsMap
   * @param {Boolean} resize 
   */
  drawDotPlot(pointsMap, resize = false){
    if(resize === true){
      this.updateMinMax(pointsMap)
    }
    this.clearGraph();
    for(let [time, value] of pointsMap){
      let[canvasX, canvasY] = this.graphToCanvasCoords(time, value);
      this.drawFilledCircle(canvasX, canvasY, 3);
    }
    this.drawGrid();
  }
  drawLineGraph(pointsMap, resize = false, drawPoints = false){
    let radius = 3;
    if(resize === true){
      this.updateMinMax(pointsMap)
    }
    this.clearGraph();
    let previousPoint = null;
    for(let [key, value] of pointsMap){
        let [xCanvas, yCanvas] = this.graphToCanvasCoords(key, value)

        if(drawPoints){
          this.drawFilledCircle(xCanvas, yCanvas, radius);
        }

        if(previousPoint !== null){
            this.drawLine(xCanvas, yCanvas, previousPoint[0], previousPoint[1], "black", 1);
        }
        previousPoint = [xCanvas, yCanvas];
    }
    this.drawGrid();

}
  /**
   * 
   * @param {ScrollingMap} points
   */
  drawMap(muscleFreeList, entityFreeList, scalingFactor = 1){ 
    this.clearGraph();
    this.drawGrid();
    this.drawMuscles(muscleFreeList, entityFreeList, true);
    this.drawEntities(entityFreeList, true, scalingFactor);
    
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
    this.ctx.fillStyle = "rgba(92, 188, 116, 1)";
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
  /* --------DRAW FUNCTIONS-------- */

  /**
   * Plots a series of points 
   * @param {ScrollingMap} pointsMap 
   */
  plotPoints(pointsMap, connectingLines = false, minMaxUpdated = false){
    //check

    this.ctx.save();

    if(minMaxUpdated){
      this.updateMinMax(pointsMap)
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
 * Takes in x and y in graphing coordinates.
 * Checks if those graphing coordinates fall within the given rect
 * @param {Number} graphingX 
 * @param {Number} graphingY
 * @param {elementRect} rect 
 * @param {String} positioning 
 */

function isWithinRect(graphingX, graphingY, rect, positioning="centered"){
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

  return (graphingX > leftSide && graphingX < rightSide) && (graphingY > topSide  && graphingY < bottomSide)
}

function create_onclick_events(){
    let buttons = document.getElementsByClassName("spawn_button");
    //create all spawn button events
    for (let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener("mousedown", onclick_event)
    }
}

