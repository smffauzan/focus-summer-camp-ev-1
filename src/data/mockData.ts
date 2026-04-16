export interface Student {
  id: string;
  name: string;
  grade?: string;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: "present" | "absent" | "unmarked";
  timestamp: string;
}

let cachedStudents: Student[] = [];

export async function getStudents(): Promise<Student[]> {
  if (cachedStudents.length > 0) return cachedStudents;
  try {
    // Fetch from backend API instead of static JSON
    const response = await fetch("/api/students");
    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }
    const students = await response.json();
    cachedStudents = students;
    return students;
  } catch (error) {
    console.error("Failed to load students:", error);
    return [];
  }
}

export async function addStudent(name: string, grade?: string): Promise<{
  success: boolean;
  student?: Student;
  error?: string;
}> {
  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student: { name, grade: grade || "" } }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to add student",
      };
    }

    const data = await response.json();
    if (data.success && data.student) {
      cachedStudents = [];
      return { success: true, student: data.student };
    }

    return { success: false, error: "Failed to add student" };
  } catch (error) {
    console.error("Error adding student:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function updateStudent(
  id: string,
  name: string
): Promise<{
  success: boolean;
  student?: Student;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to update student",
      };
    }

    const data = await response.json();
    if (data.success && data.student) {
      cachedStudents = [];
      return { success: true, student: data.student };
    }

    return { success: false, error: "Failed to update student" };
  } catch (error) {
    console.error("Error updating student:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function deleteStudent(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/students/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to delete student",
      };
    }

    const data = await response.json();
    if (data.success) {
      cachedStudents = [];
      return { success: true };
    }

    return { success: false, error: "Failed to delete student" };
  } catch (error) {
    console.error("Error deleting student:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function saveStudents(students: Student[]): Promise<void> {
  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students }),
    });
    if (response.ok) {
      cachedStudents = students;
    } else {
      console.error("Failed to save students");
    }
  } catch (error) {
    console.error("Failed to save students:", error);
  }
}

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary", "bg-accent", "bg-destructive",
    "hsl(200, 70%, 45%)", "hsl(280, 60%, 50%)", "hsl(30, 80%, 50%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}
