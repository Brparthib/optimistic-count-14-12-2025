import CounterComponents from "@/components/CounterComponents";
import { getCounter } from "@/store/counterStore";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Counter A",
    description: "This is Counter A page!"
}

export default function CounterA() {
  const initialCount = getCounter();

  return (
    <>
      <CounterComponents initialCount={initialCount} />
    </>
  );
}
