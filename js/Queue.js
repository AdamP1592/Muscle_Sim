class Queue{
    constructor(){
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    enqueue(value){
        let node = new QueueNode(value);
        //only happens when there is only a head 

        if(this.head === null){
            this.head = node;
            this.tail = node;
        }else{
            //if there is an existing tail
            this.tail.next = node;
            this.tail = node;
        }
        this.size+=1;
    }
    dequeue(){
        //empty queue
        if(this.head === null){
            return null;
        }
        let output = this.head.value;
        if(this.head === this.tail){
            this.tail = null;
            this.head = null;
        }else{
            this.head = this.head.next;
        }
        this.size--;
        return output;
    }
}
class QueueNode{
    constructor(value, next=null, previous=null){
        this.value = value;
        this.next = next;
    }
}

function queueTest(){
    let q = new Queue();
    q.enqueue(1);
    q.enqueue(2);
    console.log(q.dequeue());
    console.log(q.dequeue());
    console.log(q.dequeue());
}