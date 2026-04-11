import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amcsynborvioqgqmsbhn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY3N5bmJvcnZpb3FncW1zYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDgzMjcsImV4cCI6MjA4MjA4NDMyN30.-GSUAX4ic8U8rf5vMRNBfWGJsCxj6VNbzE7vJLoy_K0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)