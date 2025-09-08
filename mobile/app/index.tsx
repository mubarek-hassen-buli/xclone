import { View, Text, Button } from "react-native";
import React from "react";
import { useClerk } from "@clerk/clerk-expo";
const HomeScreen = () => {
  const { signOut } = useClerk();
  return (
    <View>
      <Button onPress={() => signOut()} title="Logout"></Button>
    </View>
  );
};

export default HomeScreen;
