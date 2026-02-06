import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { useFollow } from "@/hooks/useFollow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileScreens = () => {
  const insets = useSafeAreaInsets();
  const { username } = useLocalSearchParams<{ username?: string }>();
  const { currentUser: me } = useCurrentUser();
  const { profileUser, isLoading, error, refetch: refetchProfileData } = useUserProfile(username);

  const isOwnProfile = !username || username === me?.username;
  const isFollowing = profileUser?.followers?.some((f: any) => 
    typeof f === 'string' ? f === me?._id : f._id === me?._id
  );

  const { followUser, isFollowingLoading } = useFollow(profileUser?._id || "", profileUser?.username);

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(profileUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchMyProfile,
  } = useProfile();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </SafeAreaView>
    );
  }

  if (error || !profileUser) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-gray-600">
          {error ? "Failed to load profile." : "User not found."}
        </Text>
      </SafeAreaView>
    );
  }

  const handleFollow = () => {
    followUser();
  };

  const handleMessage = () => {
    router.push({
      pathname: "/messages",
      params: { 
        recipientId: profileUser._id,
        name: `${profileUser.firstName} ${profileUser.lastName}`,
        avatar: profileUser.profilePicture,
        username: profileUser.username
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {profileUser.firstName} {profileUser.lastName}
          </Text>
          <Text className="text-gray-500 text-sm">{userPosts?.length || 0} Posts</Text>
        </View>
        {isOwnProfile ? <SignOutButton /> : (
          <TouchableOpacity onPress={() => {}}>
            <Feather name="more-horizontal" size={24} color="#657786" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfileData();
              refetchPosts();
              if (isOwnProfile) refetchMyProfile();
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        <Image
          source={{
            uri:
              profileUser.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="px-4 pb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              source={{ uri: profileUser.profilePicture || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            {isOwnProfile ? (
              <TouchableOpacity
                className="border border-gray-300 px-6 py-2 rounded-full"
                onPress={openEditModal}
              >
                <Text className="font-semibold text-gray-900">Edit profile</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleMessage}
                  className="size-10 border border-gray-300 rounded-full items-center justify-center"
                >
                  <Feather name="mail" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFollow}
                  disabled={isFollowingLoading}
                  className={`${isFollowing ? 'border border-gray-300' : 'bg-black'} px-6 py-2 rounded-full`}
                >
                  {isFollowingLoading ? (
                    <ActivityIndicator size="small" color={isFollowing ? "#000" : "#fff"} />
                  ) : (
                    <Text className={`font-semibold ${isFollowing ? 'text-gray-900' : 'text-white'}`}>
                      {isFollowing ? "Following" : "Follow"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-bold text-gray-900 mr-1">
                {profileUser.firstName} {profileUser.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#1DA1F2" />
            </View>
            <Text className="text-gray-500 mb-2">@{profileUser.username}</Text>
            {profileUser.bio && <Text className="text-gray-900 mb-3">{profileUser.bio}</Text>}

            {profileUser.location && (
              <View className="flex-row items-center mb-2">
                <Feather name="map-pin" size={16} color="#657786" />
                <Text className="text-gray-500 ml-2">{profileUser.location}</Text>
              </View>
            )}

            <View className="flex-row items-center mb-3">
              <Feather name="calendar" size={16} color="#657786" />
              <Text className="text-gray-500 ml-2">
                Joined {profileUser.createdAt ? format(new Date(profileUser.createdAt), "MMMM yyyy") : "Recently"}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{profileUser.following?.length || 0}</Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold">{profileUser.followers?.length || 0}</Text>
                  <Text className="text-gray-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PostsList username={profileUser?.username} />
      </ScrollView>

      {isOwnProfile && (
        <EditProfileModal
          isVisible={isEditModalVisible}
          onClose={closeEditModal}
          formData={formData}
          saveProfile={saveProfile}
          updateFormField={updateFormField}
          isUpdating={isUpdating}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreens;
