# Data Structures Documentation

## Queue

**Description:**  

>Standard queue using linkedlist for o(1) enqueue and dequeue. If Queue is empty head and tail are empty

**Variables:** 

- Queue.head 
    * Type: QueueNode or null
    * The first entry in the Queue  

- Queue.tail  
    * Type: QueueNode or null
    * The last entry in the Queue  

- Queue.size  
    * Type: Number
    * The total size of the Queue   

**Functions**

*Queue.enqueue(value)*
- Adds some value to the end of the queue

*Queue.dequeue()*
- Removes the value a the first position and returns it. If empty, returns null.

## QueueNode

**Description**  

>A single node for the linked-list based queue

**Variables**

- QueueNode.value
    * The value this node stores

- QueueNode.next
    * Type: If exists QueueNode else null
    * The node this node connects to. May be null.

## FreeList

**Description:**  

>A list that, on deletion, instead of removing the index and shifting the list, nulls the object the index references and stores the freed position in a queue. When the list is pushed to, instead of solely using the last index, the FreeList tries to pull from the list of freed positions. O(1) deletion and push.  

**Varaibles**  

- FreeList.free: 
    * Type: Queue
    * A Queue of all the indices that have been freed by a deletion from FreeList.list

- FreeList.list:
    * Type: Array
    * The underlying storage array

**Functions:**

*FreeList.get(index)*
- Returns the value at some index if index exists. Otherwise returns null

*FreeList.set(index, value)*
- Sets the value at some index

*FreeList.push(value)*
- Pushes either to some freed position in the list or to the very end of the list
- Returns the index the object was placed at

*FreeList.remove(index)*
- Removes whatever is at the given index and adds the index to the Queue of freed indices. Ignores index out of bounds and freed indices

*Iterator*
- Builtin iterator to be used in for-of style loops.
- Yields only the active positions giving [index, item]
- Pushing during iteration may not yield a value at the final index, but pushing, itself returns the index it is at, so keep that in mind

*Notes*
- null is reserved for freed spots. You cannot push or set any value to null for the sake of indexing. 
- Access(get/set), removal(remove), and push is always O(1).
- Future optimization for sparse FreeList is: a fully indexable linked-list. This is primarily to change the operation of iterating so it no longer iterates over the full length of the array, and instead only the active indices.

## BiMap

**Description:**
> An implementation of a bidirectional map that uses key->set to maintain only unique connections. This is implemented through a map-set structure where the key maps to a set on the forwards end. On the backwards end each member of the set maps to a specific key. This is to maintain o(1) lookup. Removal has two modes. The primary removal modes are forwardRemoval and backwardRemoval, which are o(m) where m is size of the set and remove all instances of the connection to some forwardValue or some backwardValue. Then there is an o(1) removal mode where you are only removing a specific key->value pair. 

**Variables:** 
- BiMap.#forwards
    * Type: Map
    * A private member of the class that stores the forwards Map

- BiMap.#backwards
    * Type: Map
    * A private member of the class that stores the backwards Map
**Functions:** 

*BiMap.toString()*
- Overrides the standard toString function so you can call String(BiMap)

*BiMap.put(a, b)*
- Places the connection a->b in the forwards map and the connection b->a in the backwards map

*BiMap.forwardGet(a)*
- returns the set that a points to in the forwards map

*BiMap.backwardGet(b)*
- returns the set of keys that point to b in the forwards map.

*BiMap.removeForwards(a)*
- Removes the key a from the forwards Map. Also removes all connections to a from the backwards set.

*BiMap.removeBackwards(b)*
- Removes the key b from the backwards Map. Also removes all connections to b from the forwards set.

*BiMap.remove(a, b)*
- Removes the connection b from the set a points to in the forwards map. Removes the connection a from the set b points to in the backwards set. Cleans up any key that points to an empty set

## ScrollingMap

**Description:**  
>A map that is limited to some maxSize. When you push to a map that is already at it's max size it removes the earliest key->value pair. All operation besides iterating are o(1)

**Variables:** 

- maxSize
    * Type: Number
    * The maximum number of entries the map can contain

- #scrollingMap
    * Type: Map
    * A private member of the class containing the actual Map that stores everything

**Functions:** 

*ScrollingMap.push(key, value)*
- This is the core function of the ScrollingMap. When you push a key->value pair to the map and it's below maxSize, it's a normal set() function of a map. 
- When the number of entries is equal to the maximum allowed number of entries, the map deletes the first key placed in the map. 
- If the map already contains the key, it does not effect the size of the map, and just updates the value.

*ScrollingMap.replace(key, value)*
- Replaces the value of a given key so long as the key exists

*ScrollingMap.delete(key)*
- Passes on the delete function of the scrollingMap

*ScrollingMap.get(key)*
- Passes on the get function of the scrollingMap

*ScrollingMap.[Symbol.iterator()]*
- Passes on the iterator of the scrollingMap

*Notes*
- Scrolling map preserves insertion order.
- Never exceeds maxSize
- All operations besides iteration are O(1) average


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