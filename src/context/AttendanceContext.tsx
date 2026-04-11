import React, { createContext, useContext, type ReactNode } from "react";
import { useAttendance } from "@/hooks/useAttendance";

type AttendanceContextType = ReturnType<typeof useAttendance>;

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const attendance = useAttendance();
  return (
    <AttendanceContext.Provider value={attendance}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendanceContext must be used within AttendanceProvider");
  return ctx;
}
