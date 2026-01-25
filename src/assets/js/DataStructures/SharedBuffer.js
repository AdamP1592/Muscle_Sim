class SharedBuffer{
    #SAB
    #entriesPerObject
    #typedBuffer
    constructor(numObjects, numEntriesPerObject = 1){
        this.#SAB = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * numObjects * numEntriesPerObject);
        this.#typedBuffer = new Float64Array(this.#SAB)
        this.#entriesPerObject = numEntriesPerObject;
    }
    get(objectIndex){
        // all the constraints
        if(typeof objectIndex !== "number"){
            throw new Error("Error: unsupported object data type. Object index must be a number");
        }if (objectIndex < 0 || objectIndex >= this.#typedBuffer.length / this.#entriesPerObject) {
            throw new Error("Error: objectIndex out of bounds");
        }
        // do get the output
        let output = [];

        for(let i = 0; i < this.#entriesPerObject; i++){
            let index = objectIndex + i;
            output.push(this.#typedBuffer[index]);
        }
        return output
    }  
    /**
     * 
     * @param {Number} objectIndex 
     * @param {Array} objectData 
     */
    set(objectIndex, objectData){
        // all the constraints
        if(!Array.isArray(objectData)){
            throw new Error("Error: unsupported object data type. Object data must be a array");
        }
        if(typeof objectIndex !== "number"){
            throw new Error("Error: unsupported object data type. Object index must be a number");
        }
        if (objectIndex < 0 || objectIndex >= this.#typedBuffer.length / this.#entriesPerObject) {
            throw new Error("Error: objectIndex out of bounds");
        }
        if (objectData.length !== this.#entriesPerObject) {
            throw new Error(`Error: objectData length must be ${this.#entriesPerObject}`);
        }
        // setting the data
        for(let i = 0; i < this.#entriesPerObject; i++){
            let index = objectIndex + i;
            Atomics.store(this.#typedBuffer, index, objectData[i]);
        }
    }
    /**
     * Copies the thread-safe buffer to an array in the heap.
     * @returns A copy of the buffer
     */
    toArray(){
        //copy buffer to heap
        const arrayCopy = this.#typedBuffer.slice();
        return arrayCopy;
    }
}