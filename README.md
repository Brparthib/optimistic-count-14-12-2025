# 🧮 Server-State Counter with Optimistic UI (Next.js App Router)

This project demonstrates how to correctly manage **server-owned state** in **Next.js App Router** using:

* **Server Actions**
* **Optimistic UI updates**
* **Rollback on failure**
* **Multi-tab consistency**
* **Race-condition safety**

---

## 🚀 What This App Does

* Displays a counter whose value lives **only on the server**
* Clicking `+1`:

  * Updates the UI immediately (optimistic update)
  * Calls a **Server Action** to increment the counter
  * Randomly fails ~30% of the time (simulated real-world errors)
* If the server rejects:

  * The UI rolls back automatically
  * A non-blocking error message is shown
* Opening the app in **multiple browser tabs**:

  * All tabs stay in sync
  * No full page reloads
  * Eventually converge to the same server value

---

## 🧠 Core Concepts (High Level)

### 1. Server is the Single Source of Truth

The counter value is **never permanently stored on the client**.
The client only displays **snapshots** received from the server.

### 2. Optimistic UI

The UI updates immediately when the user clicks `+1`, without waiting for the server response.

### 3. Rollback on Failure

If the server rejects the increment:

* The UI automatically reverts
* The app remains responsive

### 4. Multi-Tab Consistency

Multiple tabs remain synchronized using:

* `BroadcastChannel` (instant updates)
* Background polling (eventual consistency safety net)

### 5. Race-Condition Safety

Server responses include a **monotonic version number**.
The client only accepts newer versions, preventing stale updates.

---

## 📁 Project Structure

```
app/
  actions/
    actions.ts              # Server Actions (mutations)
  api/
    counter/
      route.ts              # Read-only API for polling
  page.tsx                  # Server Component (initial render)
components/
  counter.tsx               # Client Component (UI + optimism)
store/
  counterStore.ts           # Server-owned state (single source of truth)
```

---

## 🗄️ Server-Owned State

**File:** `store/counterStore.ts`

```ts
export type CounterSnapshot = {value: number, version: number};

let counter: CounterSnapshot = {value: 0, version: 0};

export function getCounter(): CounterSnapshot {
    return counter;
}

export function incrementCounterOnServer(): CounterSnapshot {
    counter = {value: counter.value + 1, version: counter.version + 1}

    return counter;
}
```

### Why this matters

* The server controls all state mutations
* The `version` ensures correct ordering of updates
* Prevents race conditions and stale UI

---

## ⚡ Server Action (Mutation Logic)

**File:** `app/actions/actions.ts`

```ts
"use server";

import { type CounterSnapshot, getCounter, incrementCounterOnServer } from "@/store/counterStore";
import { revalidatePath } from "next/cache";

export async function incrementCounterAction(): Promise<
  | { ok: true; snapshot: CounterSnapshot }
  | { ok: false; error: string; snapshot: CounterSnapshot }
> {
    await new Promise((r) => setTimeout(r, 250 + Math.random() * 600));

    if(Math.random() < 0.3){
        return {ok: false, error: "Server rejected increment!", snapshot: getCounter()}
    }

    const snapshot = incrementCounterOnServer();

    revalidatePath('/');

    return {ok: true, snapshot};
}
```

### Key Points

* Runs **only on the server**
* Randomly fails ~30% of the time
* Always returns the current server snapshot
* Triggers revalidation for consistency

---

## 🌐 Read Endpoint (Polling)

**File:** `app/api/counter/route.ts`

```ts
import { getCounter } from "@/store/counterStore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getCounter();

  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}
```

### Why polling?

* Ensures tabs eventually converge
* Works even if BroadcastChannel messages are missed

---

## 🖥️ Server Component (Initial Render)

**File:** `app/page.tsx`

```tsx
import Counter from "@/components/counter";
import { getCounter } from "@/store/counterStore";

export const dynamic = "force-dynamic";

export default function Home() {
  const snapshot = getCounter(); // server-owned truth

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Counter initial={snapshot} />
    </main>
  );
}
```

### Responsibilities

* Reads server state
* Passes snapshot to client
* No interactivity or state mutations

---

## 🧩 Client Component (Optimistic UI)

**File:** `src/components/counter.tsx`

### What it handles

* Optimistic updates (`useOptimistic`)
* Rollback on failure
* Multi-tab synchronization
* Error display
* UI rendering

### Optimistic Flow

1. User clicks `+1`
2. UI increments immediately
3. Server Action runs
4. If success → adopt server snapshot
5. If failure → rollback UI + show error

### Why `useOptimistic`

* Keeps UI responsive
* Prevents blocking or loading states
* Matches React’s recommended pattern

---

## 🔁 Multi-Tab Synchronization

### BroadcastChannel

```ts
const bc = new BroadcastChannel("server-counter");
bc.postMessage({ type: "counter-updated" });
```

* Notifies other tabs instantly
* No page reload required

### Polling (Safety Net)

```ts
setInterval(fetchAndReconcile, 2500);
```

* Guarantees eventual consistency
* Handles network or browser edge cases

---

## 🧪 Failure Handling

* Failures do **not**:

  * Freeze the UI
  * Reload the page
  * Break synchronization
* Rollback is precise and immediate
* Errors are shown inline (non-blocking)
