export const stateMachines = {
  lead: {
    new: ["qualified"],
    qualified: ["quoted"],
    quoted: ["won", "lost", "archived"],
    won: [],
    lost: [],
    archived: [],
  },
  quote: {
    draft: ["internal_review", "withdrawn"],
    internal_review: ["sent", "withdrawn"],
    sent: ["changes_requested", "accepted", "expired", "rejected", "withdrawn"],
    changes_requested: ["sent", "withdrawn"],
    accepted: [],
    expired: [],
    rejected: [],
    withdrawn: [],
  },
  order: {
    pending_advance: ["confirmed", "cancelled"],
    confirmed: ["proof_pending", "on_hold", "cancelled"],
    proof_pending: ["production_ready", "on_hold", "cancelled"],
    production_ready: ["in_production", "on_hold"],
    in_production: ["qc", "on_hold"],
    qc: ["dispatched", "in_production", "on_hold"],
    on_hold: [
      "confirmed",
      "proof_pending",
      "production_ready",
      "in_production",
      "qc",
      "cancelled",
    ],
    dispatched: ["delivered"],
    delivered: ["closed"],
    closed: [],
    cancelled: [],
  },
  payment: {
    pending: ["initiated"],
    initiated: ["paid", "failed", "expired"],
    paid: ["partially_refunded", "refunded"],
    partially_refunded: ["refunded"],
    failed: [],
    expired: [],
    refunded: [],
  },
  artwork: {
    uploaded: ["scan_pending"],
    scan_pending: ["review_required", "rejected"],
    review_required: ["proof_sent"],
    proof_sent: ["approved", "rejected", "superseded"],
    approved: [],
    rejected: [],
    superseded: [],
  },
} as const;

export type StateMachine = keyof typeof stateMachines;
export type State<M extends StateMachine> = Extract<
  keyof (typeof stateMachines)[M],
  string
>;

export class InvalidTransitionError<
  M extends StateMachine = StateMachine,
> extends Error {
  readonly name = "InvalidTransitionError";

  constructor(
    readonly machine: M,
    readonly from: State<M>,
    readonly to: State<M>,
  ) {
    super(`Cannot transition ${machine} from ${from} to ${to}.`);
  }
}

export function allowedTransitions<M extends StateMachine>(
  machine: M,
  from: State<M>,
): readonly State<M>[] {
  return stateMachines[machine][from] as readonly State<M>[];
}

export function canTransition<M extends StateMachine>(
  machine: M,
  from: State<M>,
  to: State<M>,
): boolean {
  return allowedTransitions(machine, from).includes(to);
}

export function assertTransition<M extends StateMachine>(
  machine: M,
  from: State<M>,
  to: State<M>,
): void {
  if (!canTransition(machine, from, to)) {
    throw new InvalidTransitionError(machine, from, to);
  }
}
