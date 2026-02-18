
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrbpmglvtvlgsipqihce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYnBtZ2x2dHZsZ3NpcHFpaGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTYyMjcsImV4cCI6MjA4Njk3MjIyN30.xid7rfkA2u8058RqQqS4HNPCut3kUhO52aUZJ3OBg8Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
