import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/auth-provider";
import { createFitnessGoal, deleteFitnessGoal, getProfile, listFitnessGoals, updateFitnessGoal, updateProfile } from "@/features/profile/profile-service";
import type { FitnessGoalInsert, FitnessGoalUpdate, ProfileUpdate } from "@/features/profile/profile-types";

export const profileQueryKeys = {
  all: ["profile"] as const,
  detail: (userId: string) => ["profile", userId] as const,
  goals: (userId: string) => ["profile", userId, "goals"] as const,
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileQueryKeys.detail(user?.id ?? "signed-out"),
    queryFn: () => {
      if (!user) throw new Error("Sign in to load your profile.");
      return getProfile(user.id);
    },
    enabled: Boolean(user),
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdate) => {
      if (!user) throw new Error("Sign in to update your profile.");
      return updateProfile(user.id, input);
    },
    onSuccess: (profile) => queryClient.setQueryData(profileQueryKeys.detail(profile.id), profile),
  });
}

export function useFitnessGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileQueryKeys.goals(user?.id ?? "signed-out"),
    queryFn: () => {
      if (!user) throw new Error("Sign in to load your fitness goals.");
      return listFitnessGoals(user.id);
    },
    enabled: Boolean(user),
  });
}

export function useFitnessGoalMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => user ? queryClient.invalidateQueries({ queryKey: profileQueryKeys.goals(user.id) }) : Promise.resolve();
  return {
    create: useMutation({
      mutationFn: (input: Omit<FitnessGoalInsert, "user_id">) => {
        if (!user) throw new Error("Sign in to save a fitness goal.");
        return createFitnessGoal(user.id, input);
      },
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: FitnessGoalUpdate }) => {
        if (!user) throw new Error("Sign in to update a fitness goal.");
        return updateFitnessGoal(id, input);
      },
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => {
      if (!user) throw new Error("Sign in to delete a fitness goal.");
      return deleteFitnessGoal(id);
    }, onSuccess: invalidate }),
  };
}