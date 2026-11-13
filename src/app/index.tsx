import { Redirect } from "expo-router";

import { getAuthHome } from "@/features/auth/auth-state";
import { useAuth } from "@/features/auth/auth-provider";

export default function IndexRoute() {
  const { status } = useAuth();
  return <Redirect href={getAuthHome(status)} />;
}
