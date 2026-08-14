/**
 * Weekly Executive Packet generator.
 */

import { buildSections, renderPacketMarkdown } from "./build";
import { WeeklyPacketError, validatePacketInputs } from "./validate";
import type {
  PacketSectionId,
  WeeklyExecutivePacket,
  WeeklyPacketInputs,
} from "./types";

export function generateWeeklyPacket(inputs: WeeklyPacketInputs): WeeklyExecutivePacket {
  const v = validatePacketInputs(inputs);
  if (!v.ok) {
    throw new WeeklyPacketError(v.issues.map((i) => i.message).join("; "), v.issues);
  }

  const sections = buildSections(inputs);
  const incomplete_sections = sections
    .filter((s) => s.incomplete)
    .map((s) => s.id) as PacketSectionId[];

  return {
    schema_version: "1",
    purpose: "founder_company_health_without_touring_every_system",
    week_id: inputs.week_id,
    week_start: inputs.week_start,
    week_end: inputs.week_end,
    generated_at: new Date().toISOString(),
    generated_for: inputs.generated_for,
    sections,
    founder_decisions: structuredClone(inputs.founder_decisions ?? []),
    automatic_actions: structuredClone(inputs.automatic_actions ?? []),
    incomplete_sections,
  };
}

export class WeeklyExecutivePacketGenerator {
  generate(inputs: WeeklyPacketInputs): WeeklyExecutivePacket {
    return generateWeeklyPacket(inputs);
  }

  toMarkdown(packet: WeeklyExecutivePacket): string {
    return renderPacketMarkdown(
      packet.sections,
      packet.founder_decisions,
      packet.automatic_actions,
    );
  }
}
