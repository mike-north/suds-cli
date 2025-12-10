import { describe, expect, it } from "vitest";
import { TimerModel } from "@/model.js";
import { StartStopMsg, TickMsg, TimeoutMsg } from "@/messages.js";

describe("TimerModel", () => {
  it("defaults to 1s interval and running", () => {
    const model = TimerModel.new({ timeout: 5_000 });
    expect(model.interval).toBe(1000);
    expect(model.running()).toBe(true);
    expect(model.timedOut()).toBe(false);
  });

  it("assigns unique IDs", () => {
    const a = TimerModel.new({ timeout: 1_000 });
    const b = TimerModel.new({ timeout: 1_000 });
    expect(a.id()).not.toBe(b.id());
  });

  it("init returns a command", () => {
    const model = TimerModel.new({ timeout: 1_000 });
    const cmd = model.init();
    expect(cmd).not.toBeNull();
  });

  it("decrements timeout on TickMsg", () => {
    const model = TimerModel.withInterval(3_000, 1_000);
    const [next] = model.update(new TickMsg(model.id(), 0, false));

    expect(next.timeout).toBe(2_000);
  });

  it("ignores TickMsg with wrong id", () => {
    const model = TimerModel.new({ timeout: 1_000 });
    const [next, cmd] = model.update(new TickMsg(model.id() + 99, 0, false));

    expect(next).toBe(model);
    expect(cmd).toBeNull();
  });

  it("ignores TickMsg with wrong tag", () => {
    const model = TimerModel.new({ timeout: 1_000 });
    const [next, cmd] = model.update(new TickMsg(model.id(), 99, false));

    expect(next).toBe(model);
    expect(cmd).toBeNull();
  });

  it("emits TimeoutMsg when time elapses", async () => {
    const model = TimerModel.withInterval(1_000, 1_000);
    const [, cmd] = model.update(new TickMsg(model.id(), 0, false));

    const result = await cmd?.();
    expect(result).toBeInstanceOf(TimeoutMsg);
  });

  it("formats view as human-readable string", () => {
    const model = TimerModel.new({ timeout: 65_000 });
    expect(model.view()).toBe("1m5s");
  });

  it("handles start/stop messages", () => {
    const model = TimerModel.new({ timeout: 2_000 });
    const [stopped] = model.update(new StartStopMsg(model.id(), false));
    expect(stopped.running()).toBe(false);

    const [started] = stopped.update(new StartStopMsg(stopped.id(), true));
    expect(started.running()).toBe(true);
  });
});



