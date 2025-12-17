"use server"

import { Counter, getCounter, incrementCounter } from "@/store/counterStore";
import { revalidatePath } from "next/cache";

export type ResolveReject = {success: true; counter: Counter} 
| {success: false; error: string; counter: Counter}

export async function incrementFromServer(): Promise<ResolveReject> {
    const currentCounter = getCounter();

    // simulate delay 0 to 700
    await new Promise((r) => setTimeout(r, 700));

    // simulate delay
    if(Math.random() > 0.3){
        return {success: false, error: "Network Failed...!", counter: currentCounter};
    }

    // counter increments when success
    const newCounter = incrementCounter();

    revalidatePath("/");

    return {success: true, counter: newCounter}
}