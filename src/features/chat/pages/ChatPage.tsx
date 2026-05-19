import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { chatService, createOutgoingMessage } from "@/services/chatService";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Smile,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import type { ChatContact, ChatMessage } from "@/types";

export function ChatView() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [activeContactId, setActiveContactId] = useState<string>("1");
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void chatService.getContacts().then(setContacts);
    void chatService.getMessages().then(setMessages);
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeContactId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = createOutgoingMessage(inputValue);

    setMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage],
    }));

    setInputValue("");
  };

  if (!isLoggedIn) return null; // Avoid flashing content before redirect

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const activeMessages = messages[activeContactId] || [];

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans overflow-hidden">
      {/* Sidebar / Contact List */}
      <div
        className={`
        ${isMobileListOpen ? "flex" : "hidden"} 
        md:flex flex-col w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 bg-white
      `}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-extrabold text-gray-900">Messages</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="hidden md:flex p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-[#F15B29]/30 rounded-xl outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No contacts found</div>
          ) : (
            filteredContacts.map((contact) => (
              <motion.div
                whileTap={{ scale: 0.98 }}
                key={contact.id}
                onClick={() => {
                  setActiveContactId(contact.id);
                  setIsMobileListOpen(false);
                }}
                className={`
                  flex items-center gap-4 p-4 cursor-pointer transition-colors border-l-4
                  ${activeContactId === contact.id ? "bg-orange-50 border-[#F15B29]" : "border-transparent hover:bg-gray-50"}
                `}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <ImageWithFallback
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">{contact.name}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{contact.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm truncate ${contact.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}
                    >
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-[#F15B29] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`
        ${!isMobileListOpen ? "flex" : "hidden"} 
        md:flex flex-col flex-1 bg-white
      `}
      >
        {activeContact ? (
          <>
            {/* Chat Header */}
            <header className="h-16 md:h-20 px-4 md:px-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileListOpen(true)}
                  className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="relative hidden sm:block">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <ImageWithFallback
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {activeContact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{activeContact.name}</h2>
                  <p className="text-xs text-gray-500">
                    {activeContact.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                <button className="p-2 hover:bg-gray-100 hover:text-[#F15B29] rounded-full transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 hover:text-[#F15B29] rounded-full transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#fafafa]">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {activeMessages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">
                    <p>No messages yet.</p>
                    <p className="text-sm">Send a message to start the conversation.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {activeMessages.map((msg, index) => {
                      const isMe = msg.senderId === "me";
                      const showAvatar =
                        !isMe &&
                        (index === 0 || activeMessages[index - 1].senderId !== msg.senderId);

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id}
                          className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <div className="w-8 flex-shrink-0">
                              {showAvatar && (
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                  <ImageWithFallback
                                    src={activeContact.avatar}
                                    alt={activeContact.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}
                          >
                            <div
                              className={`
                              px-4 py-2.5 rounded-2xl text-[15px]
                              ${
                                isMe
                                  ? "bg-[#F15B29] text-white rounded-br-sm"
                                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                              }
                            `}
                            >
                              {msg.text}
                            </div>

                            <div className="flex items-center gap-1 mt-1 px-1">
                              <span className="text-[11px] text-gray-400">{msg.time}</span>
                              {isMe &&
                                (msg.status === "read" ? (
                                  <CheckCheck size={14} className="text-[#F15B29]" />
                                ) : (
                                  <Check size={14} className="text-gray-400" />
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={handleSendMessage}
                className="max-w-3xl mx-auto flex items-end gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-[#F15B29]/40 focus-within:bg-white transition-colors"
              >
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                >
                  <Smile size={22} />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                >
                  <Paperclip size={22} />
                </button>

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-2.5 px-2 text-gray-700 text-[15px] scrollbar-hide"
                  rows={1}
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`
                    p-2.5 rounded-xl flex items-center justify-center transition-all
                    ${
                      inputValue.trim()
                        ? "bg-[#F15B29] text-white hover:bg-[#d94a1d] shadow-sm"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  <Send size={18} className={inputValue.trim() ? "translate-x-0.5" : ""} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#fafafa]">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Your Messages</h3>
            <p className="text-sm">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
