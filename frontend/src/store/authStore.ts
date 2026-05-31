"use client";

import { create } from "zustand";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "HOD" | "EVENT_COORDINATOR" | "PLACEMENT_OFFICER";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
  isEmailVerified?: boolean;
  institutionalId?: string;
  avatarUrl?: string;
  departmentId?: string;
  semester?: number;
  accountStatus?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setDemoUser: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Safe helper to read from local storage on client side
  const getStoredUser = (): AuthUser | null => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("scaas_user");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.error("Failed to parse persisted auth user:", err);
      }
    }
    return null;
  };

  const storedUser = getStoredUser();

  return {
    user: storedUser,
    isAuthenticated: !!storedUser,

    login: (user) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("scaas_user", JSON.stringify(user));
      }
      set({ user, isAuthenticated: true });
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("scaas_user");
      }
      set({ user: null, isAuthenticated: false });
    },

    // Quick demo login for testing without a real backend
    setDemoUser: (role) => {
      let email = "sohan.k@campus.edu";
      let firstName = "Sohan";
      let lastName = "kumar kj";
      let id = "student-demo-001";
      let institutionalId = "STU-2026-44";

      if (role === "TEACHER") {
        email = "prof.sharma@campus.edu";
        firstName = "Dr. Priya";
        lastName = "Sharma";
        id = "teacher-demo-001";
        institutionalId = "FAC-2026-10";
      } else if (role === "ADMIN") {
        email = "admin@campus.edu";
        firstName = "System";
        lastName = "Admin";
        id = "admin-demo-001";
        institutionalId = "FAC-2026-01";
      } else if (role === "HOD") {
        email = "hod.cse@campus.edu";
        firstName = "Dr. Rajesh";
        lastName = "Kumar";
        id = "hod-demo-001";
        institutionalId = "FAC-2026-02";
      } else if (role === "EVENT_COORDINATOR") {
        email = "events@campus.edu";
        firstName = "Sarah";
        lastName = "Conner";
        id = "event-demo-001";
        institutionalId = "FAC-2026-03";
      } else if (role === "PLACEMENT_OFFICER") {
        email = "placements@campus.edu";
        firstName = "Amit";
        lastName = "Verma";
        id = "placement-demo-001";
        institutionalId = "FAC-2026-04";
      }

      const demoUser: AuthUser = {
        id,
        email,
        firstName,
        lastName,
        role,
        token: "demo-jwt-token-" + role.toLowerCase().replace("_", "-"),
        isEmailVerified: true,
        institutionalId,
        avatarUrl: undefined,
        accountStatus: "ACTIVE",
        departmentId: role === "HOD" ? "cse-dept-demo-id" : undefined,
        semester: role === "STUDENT" ? 6 : undefined,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("scaas_user", JSON.stringify(demoUser));
      }
      set({
        isAuthenticated: true,
        user: demoUser,
      });
    },
  };
});

