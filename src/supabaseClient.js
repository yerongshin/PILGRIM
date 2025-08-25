import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qdpioqkksrfrsyhdcnij.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcGlvcWtrc3JmcnN5aGRjbmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTM3MzEsImV4cCI6MjA3MTQyOTczMX0.fdafmLXyc4qmAqAtpO-dU-ShuEDarANwS0t76heNbNQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
