// "use client";
// import { ItemChat } from "@/dtos/MessageDTO";
// import { createContext, useContext, useState } from "react";

// // Tạo kiểu cho context
// interface ChatItemContextType {
//   allChat: ItemChat[];
//   setAllChat: React.Dispatch<React.SetStateAction<ItemChat[]>>;
//   filteredChat: ItemChat[];
//   setFilteredChat: React.Dispatch<React.SetStateAction<ItemChat[]>>;
// }

// // Tạo context
// const ChatItemContext = createContext<ChatItemContextType | undefined>(
//   undefined
// );

// // Provider component
// export const ChatItemProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [allChat, setAllChat] = useState<ItemChat[]>([]);
//   const [filteredChat, setFilteredChat] = useState<ItemChat[]>([]);

//   return (
//     <ChatItemContext.Provider
//       value={{
//         allChat,
//         setAllChat,
//         filteredChat,
//         setFilteredChat,
//       }}
//     >
//       {children}
//     </ChatItemContext.Provider>
//   );
// };

// // Hook để sử dụng context
// export const useChatItemContext = (): ChatItemContextType => {
//   const context = useContext(ChatItemContext);
//   if (!context) {
//     throw new Error("useChatContext must be used within a ChatProvider");
//   }
//   return context;
// };
