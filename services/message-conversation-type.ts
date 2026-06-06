export type ConversationBoxSource = "auto" | "direct" | "group";

type ConversationBoxShape = {
  groupName?: string | null;
  receiverCount: number;
};

export function classifyBoxConversationType(
  box: ConversationBoxShape,
  source: ConversationBoxSource = "auto"
): "DM" | "GROUP" {
  if (source === "group") return "GROUP";

  return box.receiverCount > 2 || Boolean(box.groupName?.trim())
    ? "GROUP"
    : "DM";
}
