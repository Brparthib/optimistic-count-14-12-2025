import CounterComponents from "@/components/CounterComponents";
import { getCounter } from "@/store/counterStore";

export default function Home() {
  const initialCount = getCounter();

  return (
    <div>
      <CounterComponents initialCount={initialCount} />
    </div>
  )
}
