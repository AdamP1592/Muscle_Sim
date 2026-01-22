/**
 * Takes in two objects, checks the keys for each object and determines if there is enough of a difference
 * to not be a floating point error using epsilon as the minimum difference between the two values
 * @param {Object} stateA 
 * @param {Object} stateB 
 * @param {Number} epsilon 
 * @returns 
 */
function stateDiverges(stateA, stateB, epsilon = 1e-12){
    console.log(stateA)
    console.log(stateB)
    let divergenceIdentified = false;
    for(let [key, val] of Object.entries(stateA)){
        if(!(key in stateB)){
            console.error(`Error: key ${key} missing in stateB`);
            divergenceIdentified = true;
        }
        else if(typeof val === 'string'){
            if(val !== stateB[key]){
                //console.error(`Error: state divergence for variable: ${key}`)
                divergenceIdentified = true;
                
            }
        }
        else if(Math.abs(val - stateB[key]) > epsilon ){
            //console.error(`Error: state divergence for variable: ${key}`)
            divergenceIdentified = true;
        }
    }
    return divergenceIdentified;
}

function nestedStateDivergence(stateA, stateB, epsilon, stateDiverges = false){
    
    if((stateA == null || stateB == null) && (stateA != stateB)){
        // if either of the states are null, but not both, the state diverges
        return true;
    }else if(stateA == null && stateB == null){
        // if both states are null, the states dont diverge because they are the same
        return false;
    } // since neither stateA nor stateB is null, you can perform the recursiveStateExploration

    for(let [key, val] of Object.entries(stateA)){
        // if it's an object, check it for divergence
        if(typeof val === "object"){
            let nestedDivergence = nestedStateDivergence(stateA[key], stateB[key], epsilon, stateDiverges);
            if(nestedDivergence) stateDiverges = true;

            console.log(`Object ${key}. Diverges: ${stateDiverges}`)

            continue;
        }
        // if the val is a string, check if the strings are the same
        if(typeof val === 'string'){
            if(val !== stateB[key]){
                console.error(`Error: state divergence for variable: ${key} in ${stateA.ClassType}. StateA: ${val}, StateB:${stateB[key]}`)
                stateDiverges = true;
                
            }
        }
        // if the val isn't a string or an object, it has to be a number because the states are JSON based
        else if(Math.abs(val - stateB[key]) > epsilon){
            console.error(`Error: state divergence for variable: ${key} in ${stateA.ClassType}. StateA: ${val}, StateB:${stateB[key]}`)
            stateDiverges = true;
        }

    }
    return stateDiverges;
}
/*------------Backup Test------------*/

function testSkeletalBackup(){
    var t = 0.0;
    var dt = 0.001;

    //create a muscle
    var m = new SkeletalFiber(10, params);
    //set it's stimulation
    m.setStimulation(0, "sin", 0.5);

    //run simulation for muscle
    for(let i = 0; i < 100; i++){
        m.updateActivation(t);
        m.step(dt);
        t += dt;
    }
    //generate a new muscle and use the m.state to copy the variables to muscle n
    var n = new SkeletalFiber(0, params);
    n.state = m.state;
    console.log(n.state, m.state)

    //run the sim loop and constantly check if the states diverge. If they do throw an error.
    for(let i = 0; i < 1000; i++){
        m.updateActivation(t);
        n.updateActivation(t);

        m.step(dt);
        n.step(dt);

        if(stateDiverges(m.state, n.state)){
            throw new Error("Error in backup: m.state does not equal n.state");
        }

        t += dt;
    }
    console.log("Backup and restore test passed. muscle m and it's copy muscle n do not diverge for at least 1000 steps after copy");

}
function testSimBackup(){
    var phys = new PhysicsSim();
    phys.createFixedSquare(0, 0);
    phys.createMoveableSquare(10, 10);
    phys.createMuscle(0, 1);

    console.log(phys.state)
}
/*------------Serialization------------*/
function testSerializationManager(){
    let activationObj = new Activation(0, 10);
    
    let serializationSchemas = new Map();

    let desiredValues = new Set(["f", "t_on", "tmp"]);
    serializationSchemas.set("Activation", desiredValues);

    let serializationManager = new SerializationManager(serializationSchemas);
    console.log(serializationManager.getDeepSerializationObject(activationObj, serializationSchemas));
    
}
function testDeepSerialization(){
    let desiredPhysicsValues = new Set(["x", "y", "velocityX", "velocityY", "force_x", "force_y", "mass"]);
    let desiredEntityValues = new Set(["x", "y", "width", "height", "border", "componentForces"]);
    let desiredState = new Set(["internal state"]);

    let serializationSchemas = new Map();
    serializationSchemas.set("MoveableRect", desiredEntityValues);
    serializationSchemas.set("PhysicsObject", desiredState);

    let mvRect = new MoveableRect(10, 10, 50, 25, 15);
    mvRect.physics.velocityX = 150;

    let serializationManager = new SerializationManager();

    let serializedObject = serializationManager.getDeepSerializationObject(mvRect, serializationSchemas);
    
    return serializedObject;
}

function testSerializationInversion(){
    let serializationOfMoveableRect = testDeepSerialization();

    let newInstance = new MoveableRect(0, 0, 0, 0, 0);

    let sm = new SerializationManager();
    sm.reverseSerialization(serializationOfMoveableRect, newInstance);

    console.log(newInstance, serializationOfMoveableRect)

}
function testSimSerialization(){
    let ps = new PhysicsSim();
    let psCopy = new PhysicsSim();

    let dt = 0.001;
    let stepCount = 50;

    // create entities, remove one just to confirm deletion maintains logic
    ps.createFixedSquare(10, 10);
    ps.createMoveableSquare(50, 50);
    ps.createMoveableSquare(30, 30);
    ps.deleteObject(0);
    ps.createMuscle(1, 2);
    //set stimulation so there are dynamics
    ps.setStimulation(0, "sin", "0.5");
    
    //iterate sim a bit
    for(let i = 0; i < stepCount; i++){
        ps.step(dt)
    }
    
    //generate a serialization object
    let firstSerialization = ps.serialization;

    //convert object to json
    let jsonSerialization = JSON.stringify(firstSerialization);
    //revert json
    let unpackedJSON = JSON.parse(jsonSerialization);
    //log both the initial serialization and the unpacked one
    console.log(firstSerialization);
    console.log(unpackedJSON);

    //reverse serialization
    psCopy.reverseSerialization(unpackedJSON)

    //get the serialization obj for the copy
    let copySerialization = psCopy.serialization;

    //output both the inital serialization and the copy
    console.log(firstSerialization);
    console.log(copySerialization);

    //iterate for some time
    for(let i = 0; i < stepCount; i++){
        ps.step(dt);
        psCopy.step(dt);
    }
    //check for divergence
    console.log(nestedStateDivergence(ps.serialization, psCopy.serialization, 1e-9));
}