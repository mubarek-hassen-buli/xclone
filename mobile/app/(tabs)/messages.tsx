import { Feather } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useConversations, useConversationMessages } from "@/hooks/useMessages";
import { useUser } from "@clerk/clerk-expo";
import { Conversation, Message, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

const MessagesScreen = () => {
  const insets = useSafeAreaInsets();
  const { user: clerkUser } = useUser();
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const {
    conversations,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
    isRefetching: isRefetchingConversations,
    deleteConversation,
  } = useConversations();

  const {
    messages,
    isLoading: isLoadingMessages,
    sendMessage: sendMessageMutation,
    isSending,
  } = useConversationMessages(selectedConversation?._id || "");

  const filteredConversations = useMemo(() => {
    if (!searchText.trim()) return conversations;
    return conversations.filter((conv) => {
      const otherUser = conv.participants.find((p) => p.username !== clerkUser?.username);
      return (
        otherUser?.username.toLowerCase().includes(searchText.toLowerCase()) ||
        otherUser?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        otherUser?.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [conversations, searchText, clerkUser]);

  const handleDelete = (conversationId: string) => {
    Alert.alert("Delete Conversation", "Are you sure you want to delete this conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteConversation(conversationId),
      },
    ]);
  };

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    setNewMessage("");
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation && clerkUser) {
      const otherUser = selectedConversation.participants.find(
        (p) => p.username !== clerkUser.username
      );
      if (otherUser) {
        sendMessageMutation({
          recipientId: otherUser._id,
          content: newMessage.trim(),
        });
        setNewMessage("");
      }
    }
  };

  const getOtherUser = (participants: User[]) => {
    return participants.find((p) => p.username !== clerkUser?.username) || participants[0];
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false })
        .replace("about ", "")
        .replace(" minutes", "m")
        .replace(" minute", "m")
        .replace(" hours", "h")
        .replace(" hour", "h")
        .replace(" days", "d")
        .replace(" day", "d");
    } catch (e) {
      return "now";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search for people"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* CONVERSATIONS LIST */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingConversations}
            onRefresh={refetchConversations}
            tintColor="#1DA1F2"
          />
        }
      >
        {isLoadingConversations ? (
          <View className="p-8 items-center">
            <ActivityIndicator size="small" color="#1DA1F2" />
          </View>
        ) : filteredConversations.length === 0 ? (
          <View className="p-12 items-center">
            <Text className="text-gray-500 text-center">
              {searchText ? "No people found" : "Your inbox is empty.\nSend a message to start a conversation!"}
            </Text>
          </View>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation.participants);
            return (
              <TouchableOpacity
                key={conversation._id}
                className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                onPress={() => openConversation(conversation)}
                onLongPress={() => handleDelete(conversation._id)}
              >
                <Image
                  source={{ uri: otherUser.profilePicture || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
                  className="size-12 rounded-full mr-3"
                />

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-1">
                      <Text className="font-semibold text-gray-900" numberOfLines={1}>
                        {otherUser.firstName} {otherUser.lastName}
                      </Text>
                      <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
                        @{otherUser.username}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : formatTime(conversation.updatedAt)}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500" numberOfLines={1}>
                    {conversation.lastMessage?.content || "No messages yet"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          Tap to open • Long press to delete
        </Text>
      </View>

      <Modal visible={isChatOpen} animationType="slide" presentationStyle="pageSheet">
        {selectedConversation && (
          <SafeAreaView className="flex-1 bg-white">
            {/* Chat Header */}
            {(() => {
              const otherUser = getOtherUser(selectedConversation.participants);
              return (
                <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                  <TouchableOpacity onPress={closeChatModal} className="mr-3">
                    <Feather name="arrow-left" size={24} color="#1DA1F2" />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: otherUser.profilePicture || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
                    className="size-10 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="font-semibold text-gray-900 mr-1">
                        {otherUser.firstName} {otherUser.lastName}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm">@{otherUser.username}</Text>
                  </View>
                </View>
              );
            })()}

            {/* Chat Messages Area */}
            <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
              {isLoadingMessages ? (
                <View className="flex-1 items-center justify-center p-8">
                  <ActivityIndicator size="small" color="#1DA1F2" />
                </View>
              ) : (
                <View className="mb-4">
                  {messages.length === 0 && (
                    <Text className="text-center text-gray-400 text-sm mb-4">
                      This is the beginning of your conversation.
                    </Text>
                  )}
                  {messages.map((message: Message) => {
                    const isFromMe = message.sender.username === clerkUser?.username;
                    return (
                      <View
                        key={message._id}
                        className={`flex-row mb-3 ${isFromMe ? "justify-end" : ""}`}
                      >
                        {!isFromMe && (
                          <Image
                            source={{ uri: message.sender.profilePicture || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
                            className="size-8 rounded-full mr-2"
                          />
                        )}
                        <View className={`${isFromMe ? "items-end" : ""}`}>
                          <View
                            className={`rounded-2xl px-4 py-3 max-w-[280px] ${
                              isFromMe ? "bg-blue-500" : "bg-gray-100"
                            }`}
                          >
                            <Text className={isFromMe ? "text-white" : "text-gray-900"}>
                              {message.content}
                            </Text>
                          </View>
                          <Text className="text-[10px] text-gray-400 mt-1">
                            {formatTime(message.createdAt)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Message Input */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-100 mb-2">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-3">
                <TextInput
                  className="flex-1 text-base max-h-32"
                  placeholder="Start a message..."
                  placeholderTextColor="#657786"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={handleSendMessage}
                className={`size-10 rounded-full items-center justify-center ${
                  newMessage.trim() && !isSending ? "bg-blue-500" : "bg-gray-200"
                }`}
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Feather name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default MessagesScreen;
