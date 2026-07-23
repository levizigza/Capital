import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { HarborNpcMesh } from "../world3d/VoyagerMesh";
import type { CapitalCharacter, MoneyForm } from "../character";
import type { NpcEmote } from "../story/dialogueActionSync";
import { BB, type NpcPoseId, type Vec3 } from "./index";
import { createHarborAgent, createShoreAmbientAgent } from "./graphs";
import type { HarborNpcLife } from "../harborNpcLives";
import type { AmbientResident } from "../islandCulture";
import type { BehaviorGraphAgent } from "./agent";

function emoteToPose(emote: NpcEmote): NpcPoseId {
  if (emote === "idle") return "stand";
  return emote;
}

type HarborBrainProps = {
  life: HarborNpcLife;
  look: CapitalCharacter;
  coat: string;
  form: MoneyForm;
  glyph?: string;
  guidedEmote?: NpcEmote;
  keeperSpeech?: string | null;
  showPulse?: boolean;
  nearPlayer?: boolean;
  playerPos: React.MutableRefObject<THREE.Vector3>;
  /** Push live body into parent registry for proximity / HUD */
  bodyOut: React.MutableRefObject<Map<string, { position: Vec3; line: string; name: string }>>;
};

/**
 * Harbor NPC driven by a Unity-Behavior-style graph agent
 * (Blackboard + Sequence / TryInOrder / Navigate / Wait / Conditional).
 */
export function HarborBehaviorNpc({
  life,
  look,
  coat,
  form,
  glyph,
  guidedEmote = "idle",
  keeperSpeech,
  showPulse,
  nearPlayer,
  playerPos,
  bodyOut,
}: HarborBrainProps) {
  const agent = useMemo(() => createHarborAgent(life), [life]);
  const group = useRef<THREE.Group>(null);
  const [pose, setPose] = useState<NpcPoseId>("stand");

  useEffect(() => {
    const guided = guidedEmote === "idle" ? null : emoteToPose(guidedEmote);
    agent.blackboard.set(BB.guidedPose, guided);
  }, [agent, guidedEmote]);

  useFrame((_, dt) => {
    const p = playerPos.current;
    agent.blackboard.set(BB.playerPos, [p.x, 0, p.z] as Vec3);
    const body = agent.tick(dt);
    if (group.current) {
      group.current.position.set(body.position[0], 0, body.position[2]);
      group.current.rotation.y = body.yaw;
    }
    if (body.pose !== pose) setPose(body.pose);
    bodyOut.current.set(life.mascotId, {
      position: body.position,
      line: body.line,
      name: body.name,
    });
  });

  const bubble = nearPlayer
    ? guidedEmote === "wave"
      ? "👋 Hi! Come talk!"
      : guidedEmote === "cheer"
        ? "🎉 You got this!"
        : guidedEmote === "nod"
          ? "🙂 *nod nod*"
          : guidedEmote === "point"
            ? "👉 That way!"
            : guidedEmote === "talk" && keeperSpeech
              ? keeperSpeech
              : null
    : null;

  return (
    <group ref={group}>
      {showPulse ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 1.1]}>
          <ringGeometry args={[0.85, 1.25, 28]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
      <HarborNpcMesh
        coat={coat}
        form={form}
        glyph={glyph}
        character={look}
        pose={pose}
        animationStyle="capital-default"
      />
      <Billboard position={[0, 2.05, 0]} follow>
        <Text
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#0f172a"
        >
          {agent.blackboard.getOr(BB.name, life.mascotId)}
        </Text>
      </Billboard>
      {bubble ? (
        <Billboard position={[0, 2.55, 0]} follow>
          <Text
            fontSize={0.16}
            color="#fef3c7"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.022}
            outlineColor="#0f172a"
            maxWidth={3.4}
            textAlign="center"
          >
            {bubble}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}

type ShoreDriverProps = {
  resident: AmbientResident;
  playerPos: React.MutableRefObject<THREE.Vector3>;
  /** Render mesh with live pose; group transform is applied by the driver */
  render: (pose: NpcPoseId) => React.ReactNode;
};

export function ShoreBehaviorDriver({ resident, playerPos, render }: ShoreDriverProps) {
  const agentRef = useRef<BehaviorGraphAgent | null>(null);
  if (!agentRef.current) agentRef.current = createShoreAmbientAgent(resident);
  const group = useRef<THREE.Group>(null);
  const [pose, setPose] = useState<NpcPoseId>("stand");

  useFrame((_, dt) => {
    const agent = agentRef.current!;
    const p = playerPos.current;
    agent.blackboard.set(BB.playerPos, [p.x, 0, p.z] as Vec3);
    const body = agent.tick(dt);
    if (group.current) {
      group.current.position.set(body.position[0], 0, body.position[2]);
      group.current.rotation.y = body.yaw;
    }
    if (body.pose !== pose) setPose(body.pose);
  });

  return <group ref={group}>{render(pose)}</group>;
}
