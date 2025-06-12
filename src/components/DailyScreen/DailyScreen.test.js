import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";
import DailyScreen from "./DailyScreen.vue";

describe("DailyScreen.vue", () => {
  let wrapper;
  const members = ["Alice", "Bob", "Carol"];
  const optionalMembers = ["Dave", "Eve"];

  beforeEach(() => {
    wrapper = shallowMount(DailyScreen, {
      props: {
        teamName: "TeamX",
        members,
        optionalMembers,
        start: "",
        end: "",
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it("renders MemberList, CurrentMember, and InfoDaily components", () => {
    expect(wrapper.findComponent({ name: "MemberList" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "CurrentMember" }).exists()).toBe(
      false
    );
    expect(wrapper.findComponent({ name: "InfoDaily" }).exists()).toBe(true);
  });

  it("shows start daily form when not started", () => {
    expect(wrapper.text()).toContain("Tempo da daily");
    expect(wrapper.find("button[primary]").text()).toBe("Iniciar Daily");
  });

  it("starts daily and shows CurrentMember after clicking start", async () => {
    wrapper = mount(DailyScreen, {
      props: {
        teamName: "TeamX",
        members,
        optionalMembers,
      },
    });
    await wrapper.find("button[primary]").trigger("click");
    // Wait for nextMember to be called
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(wrapper.findComponent({ name: "CurrentMember" }).exists()).toBe(
      true
    );
  });

  it('shows "Todos os membros falaram!" when hasEnded is true', async () => {
    await wrapper.setData({ hasEnded: true, currentMember: null });
    expect(wrapper.text()).toContain("Todos os membros falaram!");
    expect(wrapper.find("button[secondary]").text()).toBe("Reiniciar Daily");
  });

  it("resets daily when resetDaily is called", async () => {
    await wrapper.setData({
      currentMember: "Alice",
      timer: 10,
      currentMemberMaxTime: 10,
      minutesFromNow: 5,
      timeLeft: 100,
      isRunning: true,
      hasStarted: true,
      spokenMembers: ["Alice"],
      spokenOptional: ["Dave"],
      remainingOptional: ["Eve"],
    });
    wrapper.vm.resetDaily();
    expect(wrapper.vm.currentMember).toBe(null);
    expect(wrapper.vm.timer).toBe(0);
    expect(wrapper.vm.currentMemberMaxTime).toBe(0);
    expect(wrapper.vm.minutesFromNow).toBe(15);
    expect(wrapper.vm.timeLeft).toBe(0);
    expect(wrapper.vm.isRunning).toBe(false);
    expect(wrapper.vm.hasStarted).toBe(false);
    expect(wrapper.vm.spokenMembers).toEqual([]);
    expect(wrapper.vm.spokenOptional).toEqual([]);
    expect(wrapper.vm.remainingOptional).toEqual([]);
  });

  it("computes blinkClass correctly", async () => {
    await wrapper.setData({ currentMember: "Alice", timer: 9 });
    expect(wrapper.vm.blinkClass).toBe("blinking-very-fast");
    await wrapper.setData({ timer: 20 });
    expect(wrapper.vm.blinkClass).toBe("blinking-slow");
    await wrapper.setData({ timer: 40 });
    expect(wrapper.vm.blinkClass).toBe("");
  });

  it("computes timePerMember correctly", async () => {
    await wrapper.setData({ spokenMembers: ["Alice"] });
    expect(wrapper.vm.timePerMember).toBeGreaterThanOrEqual(0);
  });

  it("calls skipMember and nextMember when skip-member event is emitted", async () => {
    wrapper = mount(DailyScreen, {
      props: {
        teamName: "TeamX",
        members,
        optionalMembers,
      },
    });
    await wrapper.setData({ currentMember: "Alice", isRunning: true });
    await wrapper.vm.$nextTick();
    const currentMember = wrapper.findComponent({ name: "CurrentMember" });
    await currentMember.vm.$emit("skip-member");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentMember).not.toBe("Alice");
  });

  it("calls resetDaily when reset-daily event is emitted", async () => {
    wrapper = mount(DailyScreen, {
      props: {
        teamName: "TeamX",
        members,
        optionalMembers,
      },
    });
    const spy = vi.spyOn(wrapper.vm, "resetDaily");
    const currentMember = wrapper.findComponent({ name: "CurrentMember" });
    expect(currentMember.exists()).toBe(false);
    await wrapper.vm.resetDaily();
    expect(spy).toHaveBeenCalled();
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: "CurrentMember" }).exists()).toBe(
      false
    );
    expect(wrapper.vm.hasStarted).toBe(false);
  });

  it("updates localMembers and localOptionalMembers when props change", async () => {
    await wrapper.setProps({ members: ["Zoe"], optionalMembers: ["Oscar"] });
    expect(wrapper.vm.localMembers).toEqual(["Zoe"]);
    expect(wrapper.vm.localOptionalMembers).toEqual(["Oscar"]);
  });
});
