//const { SeriesData } = require("echarts/types/dist/shared");

class PhysicsSim{

    #objects
    #forceAddingElements
    constructor(){
        //elements in this case are things that cause movement
        this.#forceAddingElements = new FreeList();
        this.#objects = new FreeList()
        this.t = 0
        this.connections = new BiMap();
        this.serializationManager = new SerializationManager();
    }
    // Builds the schema map for the auto serializer
    static{
        const desiredMoveableRectValues = new Set(["x", "y", "width", "height", "border", "componentForces"]);
        const desiredFixedRectValues = new Set(["x", "y", "width", "height", "border"]);
        
        const desiredSkeletalMuscleValues = new Set(["index1", "index2", "t", "border"]);
        
        //Moveable object internals
        const desiredPhysicsValues = new Set(["x", "y", "velocityX", "velocityY", "force_x", "force_y", "mass"]);
                
        //muscle model internal models
        const desiredSkeletalFiberValues = new Set(["x", "x_r", "x_ref", "xrMin", "aBar","mBar", "activation"]);
        const desiredActivationValues = new Set(["t_on", "f", "type"]);

        //sim values desired
        const desiredSimValues = new Set(["t"]);
        
        this.schemaMap = new Map([
            ["MoveableRect", desiredMoveableRectValues],
            ["Rect", desiredFixedRectValues],
            ["SkeletalMuscle", desiredSkeletalMuscleValues],
            ["PhysicsObject", desiredPhysicsValues],
            ["SkeletalFiber", desiredSkeletalFiberValues],
            ["Activation", desiredActivationValues],
            ["PhysicsSim", desiredSimValues]
        ]);
    }
    getMuscleSerialization(index){
        let muscle = this.#forceAddingElements.get(index);
        let plainObject = {}
        if(muscle != null){
            plainObject = this.serializationManager.getDeepSerializationObject(muscle, PhysicsSim.schemaMap);
        }else{
            console.error("Error: muscle not found");
        }

        return JSON.stringify(plainObject);
    }
    get serialization(){
        var serializationObj = {};
        //entity and object internals
        console.log(PhysicsSim.schemaMap);
        serializationObj["PhysicsSim"] = this.serializationManager.getDeepSerializationObject(this, PhysicsSim.schemaMap);
        

        for(let [key, muscleObject] of Object.entries(this.#forceAddingElements.getPlanObject("muscle"))){
            if(muscleObject === null){
                serializationObj[key] = null;
                continue;
            }
            serializationObj[key] = this.serializationManager.getDeepSerializationObject(muscleObject, PhysicsSim.schemaMap);
        }
        for(let [key, object] of Object.entries(this.#objects.getPlanObject("obj"))){
            if(object === null){
                 serializationObj[key] = null;
                 continue;
            }
            serializationObj[key] = this.serializationManager.getDeepSerializationObject(object, PhysicsSim.schemaMap);
        }
        let serializedJSON = JSON.stringify(serializationObj);

        return serializedJSON
    }
    reverseSerialization(serializationJSON){
        let serializationObject = JSON.parse(serializationJSON);
        //since the objects and entities are stored privately, each object and entity is unpacked
        //individually, same with the sim needs itself(currently just t)
        
        var serializationManager = new SerializationManager();

        let physicsSimSerialization = serializationObject["PhysicsSim"];
        
        //unpack sim values
        serializationManager.reverseSerialization(physicsSimSerialization, this);

        const registry = {
            "MoveableRect": MoveableRect,
            "Rect": Rect,
            "SkeletalMuscle": SkeletalMuscle,
            "PhysicsObject": PhysicsObject,
            "SkeletalFiber": SkeletalFiber,
            "Activation": Activation
        }

        let objectIndicesToRemove = [];
        let muscleIndicesToRemove = [];

        for(let [key, serialization] of Object.entries(serializationObject)){
            let objectName = key.slice(0, -1);
            //sim already unpacked
            if(key === "PhysicsSim"){
                continue;
            }
            //if the serialization is null the object doesn't exist
            if(serialization === null){
                if(objectName === "obj"){
                    objectIndicesToRemove.push(this.#objects.push(-1));
                }else if(objectName === "muscle"){
                    muscleIndicesToRemove.push(this.#forceAddingElements.push(-1));
                }else{
                    throw new Error(`Error: Unknown object type: ${objectName}`)
                }
                //skip everything else since this is null
                continue;
            }
            
            //get the obj that corresponds with the string
            let type = serialization["ClassType"];
            let obj = registry[type];
            //if that obj doesn't exist throw an error
            if(obj == null){
                console.error(`Error: ${type} is not a given object type`);
                continue
            }

            //initialize a new instance of the class
            let initializedObject = new obj();
            //reverse the serialization to change the obj into a copy of the serialization
            serializationManager.reverseSerialization(serialization, initializedObject);
            // things that should belong to objects are stored as obj{index}
            if(objectName === "obj"){
                this.#objects.push(initializedObject);
            }else if(objectName === "muscle"){
                let newMuscleIndex = this.#forceAddingElements.push(initializedObject);
                this.connections.put(initializedObject.index1, newMuscleIndex);
                this.connections.put(initializedObject.index2, newMuscleIndex);

                //reset the activation object since the variables were just re-initialized
                initializedObject.muscle.activationObj.restart();
            }
        }
        for(let index of objectIndicesToRemove){
            this.#objects.remove(index);
        }
        for(let index of muscleIndicesToRemove){
            this.#forceAddingElements.remove(index);
        }
        
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
    createMuscle(index1, index2){
        let obj1 = this.#objects.get(index1);
        let obj2 = this.#objects.get(index2);
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
        if(connectedElements == null){
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
    /**
     * 
     * @param {Object} stateJson 
     * @returns 
     */
    #getAllMuscleStates(stateObject){
        let serializedMuscles = this.#forceAddingElements.getSerialization("muscle");
        for(let [key, muscleReference] of Object.entries(serializedMuscles)){
            // convert all muscle references into serialized states
            let referenceType = muscleReference.constructor.name
            if(referenceType === "SkeletalMuscle"){
                serializedMuscles[key] = muscleReference.state;
            }else if(referenceType === "string"){
                continue;
            }else{
                console.log(referenceType)
                throw new Error(`Error: Unknown type ${referenceType} in muscle state serialization`);
            }
        }
        return serializedMuscles;

    }

    //separate state serialization for extensibility in the future
    #getAllObjectStates(){
        let serializedObjects = this.#objects.getSerialization("object");
        for(let [key, objectReference] of Object.entries(serializedObjects)){
            let referenceType = objectReference.constructor.name
            if(referenceType === "Rect" || referenceType === "MoveableRect"){
                serializedObjects[key] = objectReference.state;
            }else if(referenceType === "string"){
                //any string points to a string with the text null in a free list
                continue;
            }else{
                //console.log(referenceType)
                throw new Error(`Error: unknown type ${referenceType} in object state serialization`);
            }
        }
        return serializedObjects;
    }


}

