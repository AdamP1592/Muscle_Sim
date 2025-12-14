class BiMap{
    constructor(){
        this.forwards = new Map();
        this.backwards = new Map();
    }
    /**
     * 
     * @param {any} a 
     * @param {any} b 
     */
    put(a, b){

        let forwardsSet = this.forwards.get(a);
        let backwardsSet = this.backwards.get(b);

        if(forwardsSet === undefined){
            forwardsSet = new Set()
            this.forwards.set(a, forwardsSet);
        }

        if(backwardsSet === undefined){
            backwardsSet = new Set()
            this.backwards.set(b, backwardsSet);
        }

        //a -> [b]
        forwardsSet.add(b);
        //b -> [a]
        backwardsSet.add(a);

    }

    forwardGet(a){
        return this.forwards.get(a);
    }
    
    backwardsGet(b){
        return this.backwards.get(b);
    }

    remove(a, b){
        const forwardsSet = this.forwards.get(a)
        const backwardsSet = this.backwards.get(b)

        if(forwardsSet !== undefined){
            forwardsSet.delete(b);
            if(forwardsSet.size === 0){
                this.forwards.delete(a)
            }
        }
        
        if(backwardsSet !== undefined){
            backwardsSet.delete(b);
            if(backwardsSet.size === 0){
                this.backwards.delete(a)
            }
        }
    }
    get value(){
        return this.toString();
    }
    toString(){
        let bimapString = `Forwards: `;
        let forwardKeys = this.forwards.keys()

        this.forwards.forEach((value, key) => {
            bimapString += `${key}: {${[...value].join(", ")}}, `
        });

        bimapString = bimapString.substring(0, bimapString.length - 2);
        bimapString += "\nBackwards "
        this.backwards.forEach((value, key) => {
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
    someMap.put("b", "c");
    console.log(someMap + "");
    someMap.remove("a", "b");
    console.log(someMap + "")
}
