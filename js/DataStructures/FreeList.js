

/*
    Future concept. Instead of a true list for the free list make it a fully indexable linked list.
    This will reduce the cost of iterating over a free list with many removals, but costs more ram.


*/
class FreeList{
    constructor(){
        this.free = new Queue();
        this.list = [];
    }
    get size() {
        return this.list.length - this.free.size;
    }
    get(index){
        return this.list[index];
    }
    set(index, value){
        this.list[index] = value;
    }
    /**
     * Pushes some value to some open space within the FreeList.
     * If there is no open space, pushes to the end
     * @param {any} value 
     * @returns {Number} indexPlaced
     */
    push(value){

        //throw an error if you try to push a null value because the iterator will ignore it.
        if(value === null) throw new Error("Incompatible Typing: null value cannot be placed in a FreeList");

        let index = this.free.dequeue();
        //if there are no free values push to the list
        if(index === null){
            //the index is the current length: since [0, 1, 2].length == 3, and you push 4, list[3] = 4
            index = this.list.length;
            this.list.push(value);
            
        }else{
            this.list[index] = value;
        }
        
        return index;
    }
    /**
     * Removes whatever is at the given index and adds that index to the queue of free indices
     * @param {Number} index 
     */
    remove(index){
        if(this.list.length <= index) return;
        if(this.list[index] === null) return;

        this.free.enqueue(index);
        this.list[index] = null;
    }
    /**
     * Iterator that yields [index, itemAtIndex] so long as there is something at that index
     */
    *[Symbol.iterator](){
        for(let i = 0; i < this.list.length; i++){
            const item = this.list[i];
            if(item !== null){
                yield [i, item];
            }
        }
    }
    /**
     * takes in an identifier and then stores the whole data structure in a serialized object format
     * @param {String} identifier 
     */
    getPlanObject(identifier){
        let output = {};
        for(let i = 0; i < this.list.length; i++){
            if(this.list[i] !== null){
                output[identifier + i] = this.list[i];
            }else{
                output[identifier + i] = null;
            }
        }
        return output;
    }
    // SINCE OBJECTS STORED CAN BE ANY TIME UNPACKING A SERIALIZATION MUST BE DONE OUTSIDE THE OBJECT
}

function freeListTest(){
    let ls = new FreeList();
    ls.push(12);
    ls.push(15);
    //test get
    console.log(ls.get(0));
    console.log(ls.get(1));

    //test delete
    ls.remove(0);
    console.log(ls.list);

    //test pushing to the freed position
    ls.push(150);
    console.log(ls.list);

    //test pushing to the end after reallocating the freed position
    ls.push(112);
    console.log(ls.list);

    ls.remove(0);
    ls.remove(1);
    console.log(ls.list);
    ls.push(912);
    ls.push(314);
    ls.push(1252);
    console.log(ls.list);

    for(const [index, val] of ls){
        console.log(index, val);
    }
    ls.remove(1);
    for(const [index, val] of ls){
        console.log(index, val);
    }

}
