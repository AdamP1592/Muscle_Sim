class PhysicsSim{
    #objects
    #forceAddingElements
    constructor(){
        //elements in this case are things that cause movement
        this.#forceAddingElements = new FreeList();
        this.#objects = new FreeList()
        this.t = 0
        this.connections = new BiMap();
    }
    /**
     * Creates a fixed square at the graphing coordinates
     * x and y
     * @param {int} x 
     * @param {int} y 
     */

    get objects(){
        return Object.freeze(this.#objects);
    }
    get forceAddingElements(){
        return Object.freeze(this.#forceAddingElements);
    }
    createFixedSquare(x, y){
        let width = 6;
        let height = 6;
        let rect = new Rect(width, height, x, y)
        this.#objects.push(rect);
    }  
    /**
     * Creates a moveable square at the graphing coordinates
     * x and y
     * @param {int} x 
     * @param {int} y 
     */
    createMoveableSquare(x, y){
        let width = 8;
        let height = 8;
        //0.75 g
        let mass = 0.15;
        let rect = new MoveableRect(width, height, x, y, mass)
        this.#objects.push(rect)
    }
    /**
     * Creates a muscle attached to obj1 and obj2
     * index is just the index the respective object
     * is at in the objects list and is used for
     * updating forces by the sim
     * @param {physicsObject} obj1 
     * @param {physicsObject} obj2 
     * @param {int} index1 
     * @param {int} index2 
     * @returns {bool} objectCreated
     */
    createMuscle(obj1, obj2, index1, index2){

        //prevent duplicates
        for(let [index, muscle] of this.#forceAddingElements){
            //index 1 and index 2 will always be in order of least to greatest
            if(muscle.index1 == index1 && muscle.index2 == index2){
                console.log("Duplicate muscle");
                return false;
            }
        }  
        
        let newMuscle = new SkeletalMuscle(index1, index2, obj1.x, obj1.y, obj2.x, obj2.y);

        let newMuscleIndex = this.#forceAddingElements.push(newMuscle);
        
        this.connections.put(index1, newMuscleIndex);
        this.connections.put(index2, newMuscleIndex);

        return true
    }
    /**
     * Takes in dt and performs a step, updating all objects and forces
     * @param {float} dt 
     */
    step(dt){
        this.t += dt
        //console.log("Step: ", this.t);
        // updates objects to new positions
        for(let [index, obj] of this.#objects){
            obj.update(dt);
        }
        //update all muscles and add forces to the objects the muscle is connected to
        for(let [index, element] of this.#forceAddingElements){
            
            let obj1 = this.#objects.get(element.index1);
            let obj2 = this.#objects.get(element.index2);
            if(obj1 == null || obj2 == null){
                console.log(obj1, obj2, element)
            }
            
            // updates all muscles to their new length
            element.updateLength(obj1.x, obj2.x, obj1.y, obj2.y);

            // recalculates force given the new length
            let [forceX, forceY] = element.update(obj1, obj2, dt, this.t);
            // console(`muslce: ${element.index1}, ${element.index2}:\n ForceX:${forceX}\n ForceY:${forceY}`)
            // applies force to connected objects for the next step
            obj2.addForce(-forceX, -forceY);
            obj1.addForce(forceX, forceY);
        }
    }
    deleteObject(objectIndex){
        //reove the object
        this.#objects.remove(objectIndex);

        //get a set of all element indices the object is connected to
        let connectedElements = this.connections.forwardGet(objectIndex);

        //if there is nothing connected, nothing else is needed
        if(connectedElements === null){
            return
        }

        //remove all all elements the object was connected to
        for(const elementIndex of connectedElements){
            this.#forceAddingElements.remove(elementIndex);
        }

        //remove the the objectIndex and all elementIndeces 
        this.connections.removeForwards(objectIndex);

    }
    deleteElement(elementIndex){
        //remove the element
        this.#forceAddingElements.remove(elementIndex);
        //remove the the elementIndex and all objectIndices connected
        this.connections.removeBackwards(elementIndex);
    }
    updateElementBorder(index){
        let element = this.#forceAddingElements.get(index);
        element.border = !element.border;
    }
    clearElementBorders(){
        for(let [index, element] of this.#forceAddingElements){
            element.border = false;
        }
    }

    setStimulation(elementIndex, type, freq, offset=-1){

        if(offset === -1){
            offset = this.t
        }
        console.log(`Setting Stimulation for element${elementIndex}, type: ${type}, freq: ${freq}, startTime:${offset}`)
        this.#forceAddingElements.get(elementIndex).muscle.setStimulation(offset, type, freq);
    }
    getElement(index){
        return this.#forceAddingElements.get(index)
    }
    getState(){
        var stateJson = {};
        let existingMuscles = this.#forceAddingElements.list;

        //create each section
        stateJson["muscles"] = {};
        stateJson["objects"] = {};
        
        //for easy access to each section
        let muscleMap = stateJson["muscles"];
        let objectMap = stateJson["objects"]

        //gets all existing muscles and their keys, and stores all variables of those muscles
        for(let [index, existingMuscle] of this.#forceAddingElements){
            let key = "muscle" + index;
            //create muscle entry
            muscleMap[key] = {};

            //store type
            muscleMap[key][]

        }

        let unusedMuscleIndices = this.#forceAddingElements.free;

        let existingObjects = this.#objects.list;
        let unusedObjects = this.#objects.free;

    }
    setState(){

    }
}
