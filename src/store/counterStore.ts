export type Counter = {value: number, version: number};

/** 
 *counter: value for count, version for latest update, 
    prevents race condition and rollback to previous value.
*/
let counter: Counter = {value: 0, version: 0};

// for get the current counter
export function getCounter(): Counter {
    return counter; // current counter
}

// for increment values from server action hook
export function incrementCounter(): Counter {
    counter = {value: counter.value + 1, version: counter.version + 1};

    return counter;
}
