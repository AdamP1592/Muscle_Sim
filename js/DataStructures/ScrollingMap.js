class ScrollingMap{
    #scrollingMap
    /**
     * 
     * @param {Number} maxSize 
     */
    constructor(maxSize){
        this.#scrollingMap = new Map();
        this.maxSize = maxSize;
    }
    
    get size(){
        return this.#scrollingMap.size
    }
    /**
     * Core function. Limits the size of the map to maxSize while allowing you
     * to push key->value pairs to the map
     * @param {*} key 
     * @param {*} value 
     */
    push(key, value){
        this.#scrollingMap.set(key, value);

        if(this.#scrollingMap.size === this.maxSize){
            //o(1) to get first keys since keys() just generates an iterator
            const firstKey = this.#scrollingMap.keys().next().value;
            this.#scrollingMap.delete(firstKey);

        }
    }
    
    // Just passing on some useful map functions so you dont need to use the getter
    delete(key){
        this.#scrollingMap.delete(key);
    }
    get(key){
        return this.#scrollingMap.get(key);
    }
    [Symbol.iterator](){
        return this.#scrollingMap[Symbol.iterator]()
    }

    /**
     *  Replaces an existing key->value pair.
     * @param {*} key 
     * @param {*} value 
     * @returns whether the value exists
     */
    replace(key, value){
        if(this.#scrollingMap.has(key)){
            this.#scrollingMap.set(key, value);
            return true;
        }
        return false;
    }

    /**
     * Getter that only returns the readonly functions of the map
     */
    get scrollingMap() {
        const map = this.#scrollingMap;
        return {
            has: key => map.has(key),
            get: key => map.get(key),
            keys: () => map.keys(),
            values: () => map.values(),
            entries: () => map.entries(),
            [Symbol.iterator]: () => map[Symbol.iterator]()
        };
    }

}