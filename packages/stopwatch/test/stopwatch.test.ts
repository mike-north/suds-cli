import { describe, expect, it } from "vitest";
import { StopwatchModel } from "@/model.js";
import { ResetMsg, StartStopMsg, TickMsg } from "@/messages.js";

describe("StopwatchModel", () => {
  it("defaults to 1s interval, not running", () => {
    const model = StopwatchModel.new();
    expect(model.interval).toBe(1000);
    expect(model.running()).toBe(false);
    expect(model.elapsed()).toBe(0);
  });

  it("assigns unique IDs", () => {
    const a = StopwatchModel.new();
    const b = StopwatchModel.new();
    expect(a.id()).not.toBe(b.id());
  });

  it("init returns a command", () => {
    const model = StopwatchModel.new();
    const cmd = model.init();
    expect(cmd).not.toBeNull();
  });

  it("starts and stops via messages", () => {
    const model = StopwatchModel.new();
    const [running] = model.update(new StartStopMsg(model.id(), true));
    expect(running.running()).toBe(true);

    const [stopped] = running.update(new StartStopMsg(running.id(), false));
    expect(stopped.running()).toBe(false);
  });

  it("increments elapsed on TickMsg when running", () => {
    let model = StopwatchModel.withInterval(500);
    [model] = model.update(new StartStopMsg(model.id(), true));

    const [next, cmd] = model.update(new TickMsg(model.id(), 0));
    expect(next.elapsed()).toBe(500);
    expect(cmd).not.toBeNull();
  });

  it("ignores TickMsg with wrong id", () => {
    let model = StopwatchModel.new();
    [model] = model.update(new StartStopMsg(model.id(), true));

    const [next, cmd] = model.update(new TickMsg(model.id() + 123, 0));
    expect(next).toBe(model);
    expect(cmd).toBeNull();
  });

  it("rejects TickMsg with wrong tag", () => {
    let model = StopwatchModel.new();
    [model] = model.update(new StartStopMsg(model.id(), true));

    let [next] = model.update(new TickMsg(model.id(), 0));
    const [ignored, cmd] = next.update(new TickMsg(next.id(), 0));

    expect(ignored).toBe(next);
    expect(cmd).toBeNull();
  });

  it("resets elapsed time", () => {
    let model = StopwatchModel.new();
    [model] = model.update(new StartStopMsg(model.id(), true));
    [model] = model.update(new TickMsg(model.id(), 0));

    const [reset] = model.update(new ResetMsg(model.id()));
    expect(reset.elapsed()).toBe(0);
  });

  it("formats view as human-readable string", () => {
    let model = StopwatchModel.withInterval(65_000);
    [model] = model.update(new StartStopMsg(model.id(), true));
    [model] = model.update(new TickMsg(model.id(), 0)); // +65s

    expect(model.view()).toBe("1m5s");
  });
});



