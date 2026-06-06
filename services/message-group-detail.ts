export type NormalizedGroupMember = {
  id: string;
  name?: string;
  avatarUrl?: string;
  role: "admin" | "member";
};

export type NormalizedGroupDetail = {
  members: NormalizedGroupMember[];
  category?: "friends" | "family" | "work" | "other";
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function getId(value: unknown): string {
  if (typeof value === "string") return value;

  const record = asRecord(value);
  const id = record._id ?? record.id;
  return typeof id === "string" ? id : "";
}

export function normalizeGroupDetail(payload: unknown): NormalizedGroupDetail {
  const root = asRecord(payload);
  const group = asRecord(root.group ?? root.box ?? root);
  const rawMembers = Array.isArray(group.members)
    ? group.members
    : Array.isArray(group.receiverIds)
      ? group.receiverIds
      : [];
  const rawAdminIds = Array.isArray(group.adminIds)
    ? group.adminIds
    : group.adminId
      ? [group.adminId]
      : [];
  const adminIds = new Set(rawAdminIds.map(getId).filter(Boolean));
  const category =
    typeof group.category === "string" &&
    ["friends", "family", "work", "other"].includes(group.category)
      ? (group.category as NormalizedGroupDetail["category"])
      : undefined;

  const members: NormalizedGroupMember[] = [];

  rawMembers.forEach((rawMember) => {
    const member = asRecord(rawMember);
    const id = getId(member);
    if (!id) return;

    const name =
      typeof member.name === "string" ? member.name : undefined;
    const avatar =
      typeof member.avatar === "string"
        ? member.avatar
        : typeof member.avatarUrl === "string"
          ? member.avatarUrl
          : undefined;

    members.push({
      id,
      name,
      avatarUrl: avatar,
      role: adminIds.has(id) ? "admin" : "member",
    });
  });

  return { members, category };
}
