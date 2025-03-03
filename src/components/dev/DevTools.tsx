import { useState } from "@/lib/react";
import { supabase } from "@/lib/supabase";

const testUsers = [
  { email: "admin@test.com", password: "admin123", role: "Admin" },
  { email: "user@test.com", password: "user123", role: "User" },
  { email: "developer@test.com", password: "dev123", role: "Developer" },
];

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);

  const loginAs = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Error logging in as test user:", err);
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
      >
        {isOpen ? "Hide Dev Tools" : "Dev Tools"}
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
          <h3 className="text-sm font-semibold mb-2">Test Users</h3>
          <div className="space-y-2">
            {testUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => loginAs(user.email, user.password)}
                className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100"
              >
                Login as {user.role}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
