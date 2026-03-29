import { DurableObject } from "cloudflare:workers";

/**
 * Stores the rollout configuration: which version is live globally,
 * the crossfader balance for progressive rollouts, and per-user
 * version pins for targeted testing.
 *
 * Uses Durable Object for strong consistency — slider changes are
 * immediately visible to all subsequent reads, which KV's eventual
 * consistency can't guarantee.
 */

export interface RolloutState {
  layoutBase: number;    // Current stable layout version (1–10)
  layoutBalance: number; // Crossfader position: 0=prev, 50=current, 100=next
  apiBase: number;       // Current stable API version (1–10)
  apiBalance: number;    // Crossfader position: 0=prev, 50=current, 100=next
  users: Record<string, UserConfig>;
}

export interface UserConfig {
  name: string;
  layoutOverride?: number; // When set, this user is pinned to a specific layout version
  apiOverride?: number;    // When set, this user is pinned to a specific API version
}

export class RolloutConfig extends DurableObject {
  private state: RolloutState = {
    layoutBase: 1,
    layoutBalance: 50,
    apiBase: 1,
    apiBalance: 50,
    users: {},
  };

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    // Load persisted state exactly once when the isolate spins up.
    // blockConcurrencyWhile ensures no RPC calls are handled until this completes.
    ctx.blockConcurrencyWhile(async () => {
      const stored = await ctx.storage.get<RolloutState>("state");
      if (stored) this.state = stored;
    });
  }

  private async save() {
    await this.ctx.storage.put("state", this.state);
  }

  // -- RPC methods called directly by the gateway (no fetch routing needed) --

  async getState(): Promise<RolloutState> {
    return this.state;
  }

  async setGlobal(opts: Partial<Pick<RolloutState, "layoutBase" | "layoutBalance" | "apiBase" | "apiBalance">>) {
    if (opts.layoutBase !== undefined) this.state.layoutBase = opts.layoutBase;
    if (opts.layoutBalance !== undefined) this.state.layoutBalance = opts.layoutBalance;
    if (opts.apiBase !== undefined) this.state.apiBase = opts.apiBase;
    if (opts.apiBalance !== undefined) this.state.apiBalance = opts.apiBalance;
    await this.save();
    return this.state;
  }

  async addUser(id: string, name: string) {
    this.state.users[id] = { name };
    await this.save();
    return this.state;
  }

  async removeUser(id: string) {
    delete this.state.users[id];
    await this.save();
    return this.state;
  }

  async setUserOverride(id: string, overrides: { layoutOverride?: number; apiOverride?: number }) {
    if (!this.state.users[id]) return this.state;
    if (overrides.layoutOverride !== undefined)
      this.state.users[id].layoutOverride = overrides.layoutOverride;
    if (overrides.apiOverride !== undefined)
      this.state.users[id].apiOverride = overrides.apiOverride;
    await this.save();
    return this.state;
  }

  async clearUserOverride(id: string) {
    if (!this.state.users[id]) return this.state;
    delete this.state.users[id].layoutOverride;
    await this.save();
    return this.state;
  }
}
