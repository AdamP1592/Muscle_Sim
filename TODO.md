- Create method of telling users what they can do.(Tooltips, videos, etc.)
- Create node.js backend
- Create home and about pages.
- Store instance of the muscle sim.
    - Example JSON: {"simID": "abc123",
                     "models": {"muscle0":{
                                    {"definition": {"paper": "paperDOI"}},
                                    {"phenotype":{ "cellType":"cellPhenoType"}},
                                    {"protocol": {"regime": "isometric"} }
                                    {"state": {"VariableName": "VariableValue",...}}
                                }},...
                     "Objects":{
                        "Object0":{
                            "Type": "moveable"
                            "Constants":{...}
                            "Variables":{...}
                        }
                     
                     }
                    } 
- Create RESTful api for muscle sim storage.
    - Key parts:
        - Can't create resources outside the bounds of the sim graph.
        - Muscle creation validation(cant create duplicates)
        - PATCH for partial updates, UPDATE for overwriting
    - Method usage:
        - GET for getting an existing simulation
        - POST for creating anew simulation
        - PUT for replacing the sim state periodically(for backup)
        - PATCH for updating existing elements

- Couple PhysicsSim with REST calls (PATCH, POST, DE


Conceptual Notes:

Backend:

    - When a user connects initializes a sim via the nodejs api, it will store a simID.
    - Client side that will get stored as an cookie. That cookie will fill the url if it exists. If not it's defalt will be an empty space.

    - Endpoint will look like this: (localsite)/Sims/{SimID}/ 

    - If the create call passes the ID via a GET.
        - If that ID corresponds with an existing value, the backend will return it
        - if no sim state stored with that ID exists, the server will return an error

    -
    What's needed:

    1. on return of an error, create a new sim, pass the initial sim state to the server for creation. 
        - This will be done with a post to (site)/Sims/SimID

    2. on return of a json containing the sim state, generate a new sim based on the stored variables.

    then perform the game loop where every realtime second a POST is called to that same ID.


    - When a user places an object, a PATCH call is made to the endpoint (site)/Sims/(SImID)/Objects/ObjectID
    - When a user removes an object a DELETE call can be made:
        - For multiple delete method(site)/Sims/SimID
        - For an object (site/Sims/(SImID)/(Muscles or Objects))/(EntityID or ObjectID)/

Endpoints:
    - Get:(Read)
        - (Site)/Sim/(SimID)/
    
    - Post:(Create)
        - (Site)/Sim/(SimID)/
        - (site)/Sim/(SimID)/Muscles/(MuscleID)/
            - Passes JSON with all variables and the muscle description info
        - (site)/Sim/(SimID)/Entities/(EntityID)/
            - Passes JSON with all variables and Entity description info
    
    - Delete:
        - (Site)/Sim/(SimID)/
        - (site)/Sim/(SimID)/Muscles/(MuscleID)/
        - (site)/Sims(SimID)/Entities/(EntityID)/

    - Patch:(Update)
        - (site)/Sim/(SimID)/Muscles/(MuscleID)/
            - Passes json where: {variableName: newValue}
        - (site)/Sim/(SimID)/Entities/(EntityID)/
            - Passes json where: {variableName: newValue}

    
    - Put: (Delete with creation): 
        - (Site)/Sim/(SimID)