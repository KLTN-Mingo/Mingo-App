// "use client";
// import { ResponseGroupMessageDTO } from "@/dtos/MessageDTO";
// import { createContext, useContext, useState } from "react";
// export interface LatestMessage {
//   senderName: string;
//   content: string;
//   createAt: string;
//   boxId: string;
// }

// // Tạo kiểu cho context
// interface ChatContextType {
//   messages: ResponseGroupMessageDTO[];
//   setMessages: React.Dispatch<React.SetStateAction<ResponseGroupMessageDTO[]>>;
//   isOnlineChat: Record<string, boolean>;
//   setIsOnlineChat: React.Dispatch<
//     React.SetStateAction<Record<string, boolean>>
//   >;
// }

// // Tạo context
// const ChatContext = createContext<ChatContextType | undefined>(undefined);

// // Provider component
// export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [messages, setMessages] = useState<ResponseGroupMessageDTO[]>([]); // Mảng tin nhắn
//   const [isOnlineChat, setIsOnlineChat] = useState<Record<string, boolean>>({});

//   return (
//     <ChatContext.Provider
//       value={{
//         messages,
//         setMessages,
//         isOnlineChat,
//         setIsOnlineChat,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// // Hook để sử dụng context
// export const useChatContext = (): ChatContextType => {
//   const context = useContext(ChatContext);
//   if (!context) {
//     throw new Error("useChatContext must be used within a ChatProvider");
//   }
//   return context;
// };
