class SerializationManager{
    
    /*------------Checks------------*/
    #checkSchemas(serializationSchemas){
        if(!(serializationSchemas instanceof Map)){
            throw new Error("Error: serializationSchema must be a Map");
        }
        if(serializationSchemas.size === 0){
            throw new Error("Error: cannot serialize without schema");
        }
        return true;
    }
    #checkSchema(serializationSchemaSet){
        if(serializationSchemaSet === undefined){
            throw new Error(`Error: undefined schema for ${currentClassName}`)
        }
        if(!(serializationSchemaSet instanceof Set)){
            throw new Error(`TypeError: serializationSchema for Object ${currentClassName} is not a set`);
        }
        return true;
    }

    /*------------End of checks------------*/

    /*------------Serialization------------*/

    getShallowSerializationObject(classInstance){
        if(classInstance == null){
            throw new Error("Error: cannot serialize a null object");
        }
        let variablesInClass = Object.keys(classInstance);
        var mapSerialization = {};
        for(let [variableName, value] of Object.entries(classInstance)){
            if(this.variableNamesMap.get(variableName) !== undefined){
                mapSerialization[variableName] = value;
            }
        }   

    }

    /**
     * Takes in a class instance and a serializationSchemaMap where {className: setOfVariableNames}
     * @param {Object} classInstance 
     * @param {Map<String, Set>} serializationSchema 
     */
    getDeepSerializationObject(classInstance, serializationSchemas){
        this.#checkSchemas(serializationSchemas);
        return this.#getDeepSerializationObject(classInstance, serializationSchemas);
    }


    /**
     * 
     * @param {object} classInstance 
     * @param {Map<String, Set>} serializationSchemas 
     * @returns {object} An object that stores all the variables of every nested object
     */
    #getDeepSerializationObject(classInstance, serializationSchemas){
        let currentClassName = classInstance.constructor.name;
        let currentSchema = serializationSchemas.get(currentClassName);
        let output = {}

        this.#checkSchema(currentSchema);
        //If there is nothing to look for
        if(currentSchema.size === 0){
            return output;
        }
        //iterate through all given variables of this class, if one of the variables
        //points to a class 

        for(let [variableName, variableValue] of Object.entries(classInstance)){
            let variableType = variableValue.constructor.name
            // if there is a serialization independent from the current schema, it's an object
            if(serializationSchemas.has(variableType)){
                let independentSerialization = serializationSchemas.get(variableType)
                // if that schema just points to the text "internal state", it has it's own internal
                // state. Also this is chosen because functions can't have space 
                
                //serializationSchemas.get(variableType) should return a set that contains
                //all desired variables from the object.
                
                let objectEntry = {}
                if(independentSerialization.has("internal state") && independentSerialization.size === 1){
                    //if there is a defined .state for the object use that
                    objectEntry = {[variableName]: variableValue.state};
                }else{
                    //if there isn't an internal state, explore the object to store it's serialization
                    objectEntry = {[variableName]: this.#getDeepSerializationObject(variableValue, serializationSchemas)};
                }
                // then the object has it's own object.state getter, so default to that

                output = {...output, ...objectEntry};
            }
            else if(currentSchema.has(variableName)){
                output[variableName] = variableValue;
            }
        }
        return output;
    }
    reverseSerialization(serializedObject, newInstance){
        // basically I want to take the serialized object and apply all values in the map to the corresponding
        // values in the new instance
        this.#reverseSerialization(serializedObject, newInstance);
    }
    /**
     *  
     * @param {Object} serializedObject 
     * @param {Map<String, Object>} objectMap
     */
    #reverseSerialization(serializedObject, newInstance){
        // since the serializedObject is constructed internally, the object structure should accurately mirror eachother.

        // so just reverse the structure
        for(let [variableName, value] of Object.entries(serializedObject)){
            // if the variable name is in the objectmap there is an object here;

            // since this a reconstruction, all i need to do is check if the variable points to an object
            // if it does set the object equal to the reconstruction of the object
            if(typeof value == "object"){
                console.log(variableName + " is object");
                this.#reverseSerialization(serializedObject[variableName], newInstance[variableName]);
            }else{
                console.log(`Copying ${variableName} = ${value} from serialization to instance`)
                // if it's not an object, restore it's value
                newInstance[variableName] = value;
            }
            
        }
        return newInstance;
    }
}

