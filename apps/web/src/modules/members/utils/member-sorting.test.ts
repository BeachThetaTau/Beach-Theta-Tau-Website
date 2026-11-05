import { describe, expect, it } from "vitest";
import { memberFixture } from "../../../../test/fixtures/member";
import { groupMembersByClass, splitOfficers } from "./member-sorting";

const member = (name: string, fields = {}) => ({ ...memberFixture, name, ...fields });

describe("member grouping", () => {
  it("orders classes newest first and members alphabetically without changing the source", () => {
    const members = [member("Zoe"), member("Amy"), member("Ben", { class: "Alpha Beta" })];
    const original = [...members];
    const groups = groupMembersByClass(members);
    expect(groups.Alpha!.map(({ name }) => name)).toEqual(["Amy", "Zoe"]);
    expect(groups["Alpha Beta"]).toEqual([members[2]]);
    expect(Object.keys(groups).indexOf("Alpha Beta")).toBeLessThan(
      Object.keys(groups).indexOf("Alpha"),
    );
    expect(members).toEqual(original);
  });
  it("skips missing and unknown classes and handles empty input", () => {
    expect(
      Object.values(
        groupMembersByClass([member("A", { class: "" }), member("B", { class: "Unknown" })]),
      ).flat(),
    ).toEqual([]);
    expect(Object.values(groupMembersByClass([])).flat()).toEqual([]);
  });
  it("sorts executives by office, chairs by title, and excludes members without positions", () => {
    const members = [
      member("A", { position: "Webmaster" }),
      member("B", { position: "Marshal" }),
      member("C"),
      member("D", { position: "Regent" }),
      member("E", { position: "Alumni Relations Chair" }),
    ];
    const result = splitOfficers(members);
    expect(result.executiveBoard.map(({ name }) => name)).toEqual(["D", "B"]);
    expect(result.chairs.map(({ name }) => name)).toEqual(["E", "A"]);
    expect(members.map(({ name }) => name)).toEqual(["A", "B", "C", "D", "E"]);
    expect(splitOfficers([])).toEqual({ executiveBoard: [], chairs: [] });
  });
});
