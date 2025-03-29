import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://berwztmqudqyepignhzs.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlcnd6dG1xdWRxeWVwaWduaHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDE0NzEsImV4cCI6MjA0ODQ3NzQ3MX0.iOhtMxts6lHiVmUlGqVPFYXCjaAo8Gp6-C8s8lttCRE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser(email: string) {
  try {
    // Check if user exists in auth system
    const {
      data: { users },
      error: authError,
    } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error checking auth users:", authError);
      return;
    }

    const authUser = users?.find((user) => user.email === email);

    if (authUser) {
      console.log("Found user in auth system:", {
        id: authUser.id,
        email: authUser.email,
        emailConfirmed: authUser.email_confirmed_at,
        lastSignIn: authUser.last_sign_in_at,
        createdAt: authUser.created_at,
      });

      // Check profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      if (profileError) {
        console.error("Error checking profile:", profileError);
        return;
      }

      if (profile) {
        console.log("Found user profile:", profile);
      } else {
        console.log("No profile found for user");
      }
    } else {
      console.log("No user found with email:", email);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Check the specific user
checkUser("nickneal17@gmail.com");
