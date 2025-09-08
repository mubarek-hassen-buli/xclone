import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { useSocialAuth } from "@/hooks/useSocialAuth";

export default function Index() {
  const { handleSocialAuth, isloading } = useSocialAuth();
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-between">
        <View className="flex-1 justify-center">
          {/*Demo Image*/}
          <View className="items-center">
            <Image
              source={require("../../assets/images/auth1.png")}
              className="size-96"
              resizeMode="contain"
            />
          </View>
          <View className="flex-col gap-2 my-5">
            {/*GOOGLE SIGNIN BTN*/}
            <TouchableOpacity
              className="flex-row items-center bg-white border border-gray-500 rounded-full py-3 px-6"
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isloading}
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {isloading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/google.png")}
                    className="size-10 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-black text-base font-medium">
                    continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {/*APPLE SIGNIN BTN*/}
            <TouchableOpacity
              className="flex-row items-center bg-white border border-gray-500 rounded-full py-3 px-6"
               onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isloading}
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2, //only for Android
              }}
            >
              {isloading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/apple.png")}
                    className="size-8 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-black text-base font-medium">
                    continue with Apple
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {/* Terms and Privacy */}
          <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
            By signing up, you agree to our{" "}
            <Text className="text-blue-500">Terms</Text>
            {", "}
            <Text className="text-blue-500">Privacy Policy</Text>
            {", and "}
            <Text className="text-blue-500">Cookie Use</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}
