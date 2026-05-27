import type { ChatContact, ChatMessage } from "@/types";

export function createOutgoingMessage(text: string, now = new Date()): ChatMessage {
  return {
    id: `m_${now.getTime()}`,
    senderId: "me",
    text: text.trim(),
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "sent",
  };
}

export const chatService = {
  async getContacts(): Promise<ChatContact[]> {
    return [];
  },

  async getMessages(): Promise<Record<string, ChatMessage[]>> {
    return {};
  },
};
