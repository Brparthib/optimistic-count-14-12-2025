import CounterComponents from "@/components/CounterComponents";
import { getCounter } from "@/store/counterStore";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Counter B",
    description: "This is Counter B page!"
}

export default function CounterB() {
  const initialCount = getCounter();
  return (
    <>
      <CounterComponents initialCount={initialCount} />
    </>
  );
}
