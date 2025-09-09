import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSignOut } from "@/hooks/useSignOut";
const SignOutButton = () => {
  const { handleSignOut } = useSignOut();
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Feather name="log-out" size={24} color="#E0245E" />
    </TouchableOpacity>
  );
};

export default SignOutButton;
