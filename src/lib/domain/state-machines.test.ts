import { describe, expect, it } from "vitest";
import {
  allowedTransitions,
  assertTransition,
  canTransition,
  InvalidTransitionError,
  stateMachines,
  type StateMachine,
} from "@/lib/domain/state-machines";

const illegalTransitions: Record<StateMachine, readonly [string, string]> = {
  lead: ["new", "won"],
  quote: ["draft", "accepted"],
  order: ["confirmed", "dispatched"],
  payment: ["pending", "paid"],
  artwork: ["uploaded", "approved"],
};

describe("domain state machines", () => {
  it("accepts every declared transition", () => {
    for (const [machine, transitions] of Object.entries(stateMachines) as [
      StateMachine,
      (typeof stateMachines)[StateMachine],
    ][]) {
      for (const [from, destinations] of Object.entries(transitions)) {
        for (const to of destinations) {
          expect(canTransition(machine, from as never, to as never)).toBe(true);
        }
      }
    }
  });

  it("rejects representative illegal transitions for every machine", () => {
    for (const [machine, [from, to]] of Object.entries(illegalTransitions) as [
      StateMachine,
      readonly [string, string],
    ][]) {
      expect(canTransition(machine, from as never, to as never)).toBe(false);
    }
  });

  it("gives terminal states no exits", () => {
    for (const [machine, transitions] of Object.entries(stateMachines) as [
      StateMachine,
      (typeof stateMachines)[StateMachine],
    ][]) {
      for (const [state, destinations] of Object.entries(transitions)) {
        if (destinations.length === 0) {
          expect(allowedTransitions(machine, state as never)).toEqual([]);
        }
      }
    }
  });

  it("only references declared states and reaches every state from the first", () => {
    for (const [machine, transitions] of Object.entries(stateMachines) as [
      StateMachine,
      Record<string, readonly string[]>,
    ][]) {
      const states = Object.keys(transitions);
      for (const destinations of Object.values(transitions)) {
        for (const to of destinations) expect(states).toContain(to);
      }
      const seen = new Set<string>([states[0]]);
      const queue = [states[0]];
      while (queue.length) {
        for (const next of transitions[queue.shift() as string]) {
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
      expect({ machine, unreachable: states.filter((s) => !seen.has(s)) }).toEqual(
        { machine, unreachable: [] },
      );
    }
  });

  it("protects money and production gates", () => {
    // An unpaid payment can never be refunded; refunds start from paid.
    expect(canTransition("payment", "initiated", "refunded" as never)).toBe(false);
    expect(canTransition("payment", "paid", "refunded")).toBe(true);
    expect(canTransition("payment", "paid", "partially_refunded")).toBe(true);
    // Orders cannot skip proof, production or QC.
    expect(canTransition("order", "pending_advance", "in_production" as never)).toBe(false);
    expect(canTransition("order", "proof_pending", "dispatched" as never)).toBe(false);
    expect(canTransition("order", "in_production", "dispatched" as never)).toBe(false);
    // Hold cannot jump to dispatch, and a dispatched order cannot be cancelled.
    expect(canTransition("order", "on_hold", "dispatched" as never)).toBe(false);
    expect(canTransition("order", "dispatched", "cancelled" as never)).toBe(false);
    // Failed QC returns to production; a failed scan can be rejected.
    expect(canTransition("order", "qc", "in_production")).toBe(true);
    expect(canTransition("artwork", "scan_pending", "rejected")).toBe(true);
    // An accepted quote cannot be withdrawn.
    expect(canTransition("quote", "accepted", "withdrawn" as never)).toBe(false);
  });

  it("throws a typed error for an invalid transition", () => {
    expect(() => assertTransition("lead", "new", "won")).toThrow(
      InvalidTransitionError,
    );

    try {
      assertTransition("lead", "new", "won");
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidTransitionError);
      expect(error).toMatchObject({ machine: "lead", from: "new", to: "won" });
    }
  });
});
