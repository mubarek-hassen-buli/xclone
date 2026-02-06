import { Feather } from "@expo/vector-icons";
import { View, TextInput, ScrollView, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearch } from "@/hooks/useSearch";
import { router } from "expo-router";
import { User } from "@/types";

const TRENDING_TOPICS = [
  { topic: "#ReactNative", tweets: "125K" },
  { topic: "#TypeScript", tweets: "89K" },
  { topic: "#WebDevelopment", tweets: "234K" },
  { topic: "#AI", tweets: "567K" },
  { topic: "#TechNews", tweets: "98K" },
];

const SearchScreen = () => {
  const { users, isLoading, searchQuery, setSearchQuery } = useSearch();

  const handleUserPress = (user: User) => {
    // Navigate to profile screen with username or userId
    router.push(`/profile?username=${user.username}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search XClone"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x-circle" size={18} color="#657786" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        {isLoading ? (
          <View className="p-8 items-center">
            <ActivityIndicator size="small" color="#1DA1F2" />
          </View>
        ) : searchQuery.trim().length > 0 ? (
          <View>
            {users.length > 0 ? (
              users.map((user: User) => (
                <TouchableOpacity
                  key={user._id}
                  onPress={() => handleUserPress(user)}
                  className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                >
                  <Image
                    source={{ uri: user.profilePicture || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
                    className="w-12 h-12 rounded-full"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-bold text-gray-900" numberOfLines={1}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text className="text-gray-500" numberOfLines={1}>
                      @{user.username}
                    </Text>
                    {user.bio && (
                      <Text className="text-gray-700 mt-1 text-sm" numberOfLines={1}>
                        {user.bio}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="p-8 items-center">
                <Text className="text-gray-500">No users found for "{searchQuery}"</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Trending for you</Text>
            {TRENDING_TOPICS.map((item, index) => (
              <TouchableOpacity key={index} className="py-3 border-b border-gray-100">
                <Text className="text-gray-500 text-sm">Trending in Technology</Text>
                <Text className="font-bold text-gray-900 text-lg">{item.topic}</Text>
                <Text className="text-gray-500 text-sm">{item.tweets} Tweets</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;
