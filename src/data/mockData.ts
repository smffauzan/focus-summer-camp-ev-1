export interface Student {
  id: string;
  name: string;
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
    const response = await fetch("/students.json");
    const data = await response.json();
    cachedStudents = data.students;
    return data.students;
  } catch (error) {
    console.error("Failed to load students:", error);
    return [];
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
