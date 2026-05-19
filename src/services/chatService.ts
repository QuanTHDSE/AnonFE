import { chatContacts, chatMessages } from "@/mocks/content";
import type { ChatMessage } from "@/types";

const clone = <T>(value: T): T => structuredClone(value);

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
  async getContacts() {
    return clone(chatContacts);
  },

  async getMessages() {
    return clone(chatMessages);
  },
};
