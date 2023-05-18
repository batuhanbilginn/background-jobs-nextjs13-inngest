import { createClient } from "@supabase/supabase-js"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Database } from "@/types/database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
