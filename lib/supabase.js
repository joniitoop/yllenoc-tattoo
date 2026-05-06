import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://utytpvakugeogjypyvzb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0eXRwdmFrdWdlb2dqeXB5dnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTQ4MzEsImV4cCI6MjA5MzU3MDgzMX0.ia2-bHK-sp8kH7V3WDgd4vHuFh7dWvcNBbCEocsg2Hk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)