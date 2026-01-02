class MinatureWindow{
    /**
     * 
     * @param {DOM Object} miniWindow 
     */
    constructor(miniWindow){
        this.miniWindow = miniWindow;

        this.target = null;
        this.targetClicked = false;

        this.movementPending = false;

        this.startingPosition = {x: null, y:null}

        this.lastEvent = null;

        this.clicked = this.clicked.bind(this);
        this.released = this.released.bind(this);
        this.moveEventOrchestrator = this.moveEventOrchestrator.bind(this);
        this.closeWindow = this.closeWindow.bind(this);
        this.openWindow = this.openWindow.bind(this);

        this.secondaryCloseEvent = () => {};


        this.closed = miniWindow.classList.contains("hidden");
    }
    /*--------EVENT CREATION--------*/
    addMoveEvent(target){
        //bind all functions to this so the context is maintained for this
        this.target = target;
        target.addEventListener("mousedown", this.clicked);
    }
    /**
     * 
     * @param {DomElement} closeButton 
     * @param {function} secondaryEvent 
     */
    addCloseEvent(closeButton, secondaryEvent = null){
    
        closeButton.addEventListener("click", this.closeWindow);
        if(typeof secondaryEvent === 'function'){
            this.secondaryCloseEvent = secondaryEvent;
        }
    }
    /*--------HELPER FUNCTIONS--------*/
    convertEventCoordsToClickedCoords(clientX, clientY){
        const rect = this.miniWindow.getBoundingClientRect();
        let x = clientX - rect.left;
        let y = clientY - rect.top;
        return [x, y]
    }
    /*--------CLICK AND DRAG EVENT--------*/
    clicked(event){
        event.preventDefault();

        const [x, y] = this.convertEventCoordsToClickedCoords(event.clientX, event.clientY);
        this.startingPosition.x = x;
        this.startingPosition.y = y;

        this.targetClicked = true;
        document.addEventListener('mousemove', this.moveEventOrchestrator);
        document.addEventListener('mouseup', this.released)
    }
    released(event){
        this.targetClicked = false;
        document.removeEventListener('mousemove', this.moveEventOrchestrator);
        document.removeEventListener('mouseup', this.released)
        this.targetClicked = false;
    }
    moveEventOrchestrator(event){
        if(!this.targetClicked || !this.miniWindow) return;

        this.lastEvent = event;
        // prevent multiple animation requests from happening per frame
        if(!this.movementPending){
            this.movementPending = true;
            // lastEvent to ensure the movement is adjusted to the most recent info
            window.requestAnimationFrame( () =>{
                this.movementPending = false;
                this.completeMove()
            })
        }
    }
    completeMove(){
        let mouseX = this.lastEvent.clientX - this.startingPosition.x;
        let mouseY = this.lastEvent.clientY - this.startingPosition.y;
        this.move(mouseX, mouseY);
    }
    /*--------MANUAL MOVEMENT FUNCTION--------*/
    move(x, y){
        this.miniWindow.style.top = y;
        this.miniWindow.style.left = x;
    }

    /*--------CLOSE EVENT STUFF--------*/


    closeWindow(){
        this.windowClosed = false;
        if(!this.miniWindow.classList.contains("hidden")) this.miniWindow.classList.add("hidden");
        this.secondaryCloseEvent();
    }
    openWindow(){
        this.windowClosed = true;
        if(this.miniWindow.classList.contains("hidden")) this.miniWindow.classList.remove("hidden");
    }
}
