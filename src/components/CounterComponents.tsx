"use client"

import { incrementFromServer } from "@/app/action";
import { Counter, getCounter } from "@/store/counterStore";
import { startTransition, useEffect, useOptimistic, useState } from "react";

type ReducerFunction =
  | { type: "inc" }
  | { type: "dec" }
  | { type: "sync", value: number }

const reducerFunction = (state: number, action: ReducerFunction) => {
  switch (action.type) {
    case "inc":
      return state+1;
    case "dec":
      return state-1;
    case "sync":
      return action.value
    default:
      return state;
  }
}

export default function CounterComponents({ initialCount }: { initialCount: Counter}) {
  const [count, setCount] = useState<Counter>(initialCount); // set the count
  const [error, setError] = useState<string | null>(null);

  const [optimisticCount, optimisticCounter] = useOptimistic
  <number, ReducerFunction>(count.value, reducerFunction);

   useEffect(() => {
    startTransition(() => 
      optimisticCounter({ type: "sync", value: count.value })
    );
  }, [count.value]);
  
  const handleIncrement = async () => {
    setError(null);
    startTransition(() => optimisticCounter({type: "inc"}));

    try {
      const result = await incrementFromServer();

      if(!result.success){
        setTimeout(() => {
          startTransition(() => optimisticCounter({type:"sync", value: count.value}));
        }, 500);

        setError(result.error);
        console.log("Result: ", result);
        console.log("Opmistic Count: ", optimisticCount);

        return;
      }

      console.log("Result: ", result);
      
      setCount((prev) => 
      result.counter.version > prev.version ? result.counter : prev
      );

    } catch (error) {
      console.error("Increment Failed: ", error);
    }
  }

  return (
    <>
        <div className="min-h-screen max-w-svw flex items-center justify-center">
            <div className="bg-slate-100 border border-slate-300 shadow-md rounded min-w-80 p-5 space-y-2">
                <h1 className="text-4xl font-bold">{optimisticCount}</h1>
                <button
                onClick={handleIncrement}
                className="cursor-pointer text-white bg-linear-to-r from-zinc-400 via-zinc-500 to-zinc-600 hover:bg-linear-to-br active:scale-95 dark:focus:ring-zinc-800 font-medium rounded-sm py-1 px-4 text-lg">
                    +1
                </button>
                {
                 error && <p className="text-md text-rose-600">{error}</p>
                }
            </div>
        </div>
    </>
  )
}
