class BiMap{
    #forwards
    #backwards
    constructor(){
        this.#forwards = new Map();
        this.#backwards = new Map();
    }
    /**
     * 
     * @param {any} a 
     * @param {any} b 
     */
    put(a, b){

        let forwardsSet = this.#forwards.get(a);
        let backwardsSet = this.#backwards.get(b);

        if(forwardsSet === undefined){
            forwardsSet = new Set()
            this.#forwards.set(a, forwardsSet);
        }

        if(backwardsSet === undefined){
            backwardsSet = new Set()
            this.#backwards.set(b, backwardsSet);
        }

        //a -> [b]
        forwardsSet.add(b);
        //b -> [a]
        backwardsSet.add(a);

    }

    forwardGet(a){
        return this.#forwards.get(a);
    }
    
    backwardGet(b){
        return this.#backwards.get(b);
    }

    remove(forwardsValue, backwardsValue){
        const forwardsSet = this.#forwards.get(forwardsValue)
        const backwardsSet = this.#backwards.get(backwardsValue)
        // if the set exists in the forwards map
        if(forwardsSet !== undefined){
            // delete the value of backwardsValue if it exists
            // in the set
            forwardsSet.delete(backwardsValue);
            //if the set is empty, delete the entire index from the set
            if(forwardsSet.size === 0){
                this.#forwards.delete(forwardsValue)
            }
        }
        
        // if the set exists in the backwards map
        if(backwardsSet !== undefined){
            // delete the forwards value from the backwards ap
            backwardsSet.delete(forwardsValue);
            // if the set is now empty, remove it from the backwards map
            if(backwardsSet.size === 0){
                this.#backwards.delete(backwardsValue);
            }
        }
    }
    removeForwards(forwardsValue){
        const forwardsSet = this.#forwards.get(forwardsValue);
        
        //skip everything if forwardsValue doesnt exist
        if(!forwardsSet){
            return
        }
    
        //iterate across all backwardsValues the forwardsValue points to
        for(const backwardsValue of forwardsSet){
            //get a backwardsSet that forwardsValue points to
            const backwardsSet = this.#backwards.get(backwardsValue);
            //deletes forwardsValue from the set
            backwardsSet.delete(forwardsValue);
            //deletes the set if it's empty
            if(backwardsSet.size === 0){
                this.#backwards.delete(backwardsValue)
            }
        }
        //deletes the forwards set
        this.#forwards.delete(forwardsValue)
    }
    removeBackwards(backwardsValue){
        const backwardsSet = this.#backwards.get(backwardsValue);
        
        //skip everything if backwardsValue doesnt exist
        if(!backwardsSet){
            return
        }
    
        //iterate across all forwardsValues the backwardsValue points to
        for(const forwardsValue of backwardsSet){
            //get a forwardsSet that backwardsValue points to
            const forwardsSet = this.#forwards.get(forwardsValue);
            //deletes backwardsValue from the set
            forwardsSet.delete(backwardsValue);
            //deletes the set if it's empty
            if(forwardsSet.size === 0){
                this.#forwards.delete(forwardsValue)
            }
        }
        //deletes the backwards set
        this.#backwards.delete(backwardsValue)
    }
    toString(){
        let bimapString = `Forwards: `;
        let forwardKeys = this.#forwards.keys()

        this.#forwards.forEach((value, key) => {
            bimapString += `${key}: {${[...value].join(", ")}}, `
        });

        bimapString = bimapString.substring(0, bimapString.length - 2);
        bimapString += "\nBackwards "
        this.#backwards.forEach((value, key) => {
            bimapString += `${key}: {${[...value].join(", ")}}, `
        });

        bimapString = bimapString.substring(0, bimapString.length - 2);
        
        return bimapString;
    }

}

function testBidirectionalMap(){
    let someMap = new BiMap();

    someMap.put("a", "b");
    someMap.put ("a","c");
    someMap.put("d", "c");
    console.log(someMap + "");

    console.log("Removing pair a -> b")
    someMap.remove("a", "b")
    console.log(someMap + "");
    console.log("Adding a -> b again")
    someMap.put("a", "b");

    console.log(someMap + "")
    console.log("Removing a and all backwards things that point to a");
    someMap.removeForwards("a")
    console.log(someMap + "")

}