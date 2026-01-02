/**
 * sets up the first demo visualization of the simulation(a cube following a circular motion)
 */
function demo1(){
  //create objects
  sim.createMoveableSquare(50, 50);//obj0
  sim.createFixedSquare(30, 30); //obj1
  sim.createFixedSquare(21.715729, 50)//obj2
  sim.createFixedSquare(30, 70)//obj3
  sim.createFixedSquare(78.284271, 50)//obj4
  sim.createFixedSquare(50, 78.284271)//obj5
  sim.createFixedSquare(70, 70)//obj6
  sim.createFixedSquare(70, 30)//obj7
  sim.createFixedSquare(50, 21.715729)//obj8

  let numFixed = 8;
  
  let freq = 1;
  // creates once muscle for each fixed object
  // shifts the activation pattern so that each muscle is activated freq
  // times a second and their activation peaks are evenly spaced across the full
  // stimulation cycle
  for(let i = 1; i <= numFixed; i++){
    console.log(`Creating muscle connecting(0, ${i})`)
    sim.createMuscle(sim.objects.get(0), sim.objects.get(i), 0, i)

    let shift = ((i - 1) / numFixed) * (1/freq);
    //sim.forceAddingElements.get(i - 1).muscle.setStimulation(shift, "sin", freq)
    sim.setStimulation(i - 1, "sin", freq, shift);
  }
  
}
function stressTest(){

  let count = 300;


  //identify spacing for some count
  let area = maxY * maxY;
  let areaPerNode = area/count;

  let spacing = Math.sqrt(areaPerNode);

  let cols = Math.floor(maxX/spacing);
  let rows = Math.floor(maxY/spacing);

  let rowsSelector = false;

  while(rows * cols < count){
    if(rowsSelector){
      rows += 1
    }else{
      cols += 1
    }
    rowsSelector = !rowsSelector;
  }

  const dx = maxX / cols;
  const dy = maxY / rows;

  let n = 0;
  let muscleCount = 0;

  for(let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      const x = i * dx;
      const y = j * dy;

      sim.createMoveableSquare(x, y);
      
      if(n >= 1){

        const simObjects = sim.objects;
        sim.createMuscle(simObjects.get(n-1), simObjects.get(n), n - 1, n);
        sim.setStimulation(muscleCount, 'sin', 2, offset=0)
        muscleCount++;
      }
      n += 1
    }
  }
}
function delayedMuscleActivationDemo(){

  sim.createFixedSquare(50, 50);
  sim.createMoveableSquare(100, 50);
  sim.createMuscle(sim.objects.get(0), sim.objects.get(1), 0, 1);
  for(let i = 0; i < 1000; i++){
    sim.step(0.0005)
  }
  sim.setStimulation(0, "sin", 1)
}