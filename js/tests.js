/**
 * Takes in two objects, checks the keys for each object and determines if there is enough of a difference
 * to not be a floating point error using epsilon as the minimum difference between the two values
 * @param {Object} stateA 
 * @param {Object} stateB 
 * @param {Number} epsilon 
 * @returns 
 */
function stateDiverges(stateA, stateB, epsilon = 1e-12){
    let divergenceIdentified = false;
    for(let [key, val] of Object.entries(stateA)){
        if(!(key in stateB)){
            console.error(`Error: key ${key} missing in stateB`);
            divergenceIdentified = true;
        }
        else if(typeof val === 'string'){
            if(val !== stateB[key]){
                console.error(`Error: state divergence for variable: ${key}`)
                divergenceIdentified = true;
                
            }
        }
        else if(Math.abs(val - stateB[key]) > epsilon ){
            console.error(`Error: state divergence for variable: ${key}`)
            divergenceIdentified = true;
        }
    }
    return divergenceIdentified;
}
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