import React, { createContext, useContext, type ReactNode } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import type { Student } from "@/data/mockData";

type AttendanceContextType = ReturnType<typeof useAttendance> & {
  students: Student[];
  addStudent: (name: string) => void;
  editStudent: (id: string, newName: string) => void;
  deleteStudent: (id: string) => void;
};

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const attendance = useAttendance();
  return (
    <AttendanceContext.Provider value={attendance as AttendanceContextType}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendanceContext must be used within AttendanceProvider");
  return ctx;
}
