import { DurableObject } from "cloudflare:workers";

export interface RolloutState {
  layoutBase: number; // current stable version (1-10)
  layoutBalance: number; // 0-100, 50=center (100% current), >50=mixing next, <50=mixing prev
  apiVersion: number;
  users: Record<
    string,
    { layoutOverride?: number; apiOverride?: number; name: string }
  >;
}

export class RolloutConfig extends DurableObject {
  private state: RolloutState = {
    layoutBase: 1,
    layoutBalance: 50,
    apiVersion: 1,
    users: {},
  };

  async init() {
    const stored = await this.ctx.storage.get<RolloutState>("state");
    if (stored) this.state = stored;
  }

  private async save() {
    await this.ctx.storage.put("state", this.state);
  }

  async getState(): Promise<RolloutState> {
    await this.init();
    return this.state;
  }

  async setGlobal(opts: {
    layoutBase?: number;
    layoutBalance?: number;
    apiVersion?: number;
  }) {
    await this.init();
    if (opts.layoutBase !== undefined) this.state.layoutBase = opts.layoutBase;
    if (opts.layoutBalance !== undefined)
      this.state.layoutBalance = opts.layoutBalance;
    if (opts.apiVersion !== undefined) this.state.apiVersion = opts.apiVersion;
    await this.save();
    return this.state;
  }

  async addUser(id: string, name: string) {
    await this.init();
    this.state.users[id] = { name };
    await this.save();
    return this.state;
  }

  async removeUser(id: string) {
    await this.init();
    delete this.state.users[id];
    await this.save();
    return this.state;
  }

  async setUserOverride(
    id: string,
    layoutOverride?: number,
    apiOverride?: number
  ) {
    await this.init();
    if (!this.state.users[id]) return this.state;
    if (layoutOverride !== undefined)
      this.state.users[id].layoutOverride = layoutOverride;
    if (apiOverride !== undefined)
      this.state.users[id].apiOverride = apiOverride;
    await this.save();
    return this.state;
  }

  async clearUserOverride(id: string, field: "layout" | "api") {
    await this.init();
    if (!this.state.users[id]) return this.state;
    if (field === "layout") delete this.state.users[id].layoutOverride;
    if (field === "api") delete this.state.users[id].apiOverride;
    await this.save();
    return this.state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/state") {
      await this.init();
      return Response.json(this.state);
    }

    if (request.method === "POST" && path === "/global") {
      const body = await request.json<{
        layoutBase?: number;
        layoutBalance?: number;
        apiVersion?: number;
      }>();
      const state = await this.setGlobal(body);
      return Response.json(state);
    }

    if (request.method === "POST" && path === "/user") {
      const body = await request.json<{ id: string; name: string }>();
      const state = await this.addUser(body.id, body.name);
      return Response.json(state);
    }

    if (request.method === "DELETE" && path.startsWith("/user/")) {
      const id = path.split("/user/")[1];
      const state = await this.removeUser(id);
      return Response.json(state);
    }

    if (request.method === "POST" && path.startsWith("/user/")) {
      const id = path.split("/user/")[1];
      const body = await request.json<{
        layoutOverride?: number;
        apiOverride?: number;
      }>();
      const state = await this.setUserOverride(
        id,
        body.layoutOverride,
        body.apiOverride
      );
      return Response.json(state);
    }

    if (request.method === "POST" && path.startsWith("/clear/")) {
      const parts = path.split("/");
      const id = parts[2];
      const field = parts[3] as "layout" | "api";
      const state = await this.clearUserOverride(id, field);
      return Response.json(state);
    }

    return new Response("Not found", { status: 404 });
  }
}
