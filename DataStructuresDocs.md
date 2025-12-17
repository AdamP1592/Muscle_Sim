# Data Structures Documentation

## Queue

**Description:**  

>Standard queue using linkedlist for o(1) enqueue and dequeue  

**Variables:** 

- Queue.head  
    * The first entry in the Queue  

- Queue.tail  
    * The last entry in the Queue  

- Queue.size  
    * The total size of the Queue   

**Functions**

*Queue.enqueue(value)*
- Adds some value to the end of the queue

*Queue.dequeue(value)*
- Removes the value a the first position and returns it

## QueueNode

**Description**  

>A single node for the linked-list based queue

**Variables**

- QueueNode.value
    * The value this node stores

- QueueNode.next
    * The node this node connects to

## FreeList

**Description:**  

>A list that, on deletion, instead of removing the index and shifting the list, nulls the object the index references and stores the freed position in a queue. When the list is pushed to, instead of solely using the last index, the FreeList tries to pull from the list of freed positions. O(1) deletion and push.  

**Varaibles**  

- FreeList.free: 
    * Type: Queue
    * A Queue of all the indices that have been freed by a deletion.

- FreeList.list:
    * Type: Array
    * The raw array the FreeList represents

**Functions:**

*FreeList.get(index)*
- Returns the value at some index

*FreeList.set(index, value)*
- Sets the value at some index

*FreeList.push(value)*
- Pushes either to some freed position in the list or to the very end of the list
- Returns the index the object was placed at

*FreeList.remove(index)*
- Removes whatever is at the given index and adds the index to the Queue of freed indices

*Iterator*
- Builtin iterator to be used in for-of style loops.
- Yields only the active positions giving [index, item]

## BiMap

**Description:**
> An implementation of a bidirectional map that uses key->set to maintain only unique connections. This is implemented through a map-set structure where the key maps to a set on the forwards end. On the backwards end each member of the set maps to a specific key. This is to maintain o(1) lookup. Removal has two modes. The primary removal modes are forwardRemoval and backwardRemoval, which are o(n) where n is the number of members in the set and remove all instances of the connection to some forwardValue or some backwardValue. Then there is an o(1) removal mode where you are only removing a specific key->value pair, but is only used in very specific cases. 

**Variables:** 
- BiMap.#forwards
    * Type: Map
    * A private member of the class that stores the forwards Map

- BiMap.#backwards
    * Type: Map
    * A private member of the class that stores the backwards Map
**Functions:** 

*BiMap.value*
- A getter that returns the string version of the map

*BiMap.toString()*
- Overrides the standard toString function so you can call String(BiMap)

*BiMap.put(a, b)*
- Places the connection a->b in the forwards map and the connection b->a in the backwards map

*BiMap.forwardGet(a)*
- returns the set that a points to in the forwards map

*BiMap.backwardGet(b)*
- returns the set that b points to in the backwards map

*BiMap.removeForwards(a)*
- Removes the key a from the forwards Map. Also removes all connections to a from the backwards set

*BiMap.removeBackwards(b)*
- Removes the key b from the backwards Map. Also removes all connections to b from the forwards set

*BiMap.remove(a, b)*
- Removes the connection b from the set a points to in the forwards map. Removes the connection a from the set b points to in the backwards set. Cleans up any key that points to an empty set




<!-- 
## ObjectName 
**Description:**  
>the description

**Variables:** 

- VariableName
    * VariableDescription

**Functions:** 

*functionName*
- Function Description

-->