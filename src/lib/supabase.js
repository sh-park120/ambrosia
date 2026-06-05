import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export function getDeviceId() {
  let id = localStorage.getItem('ambrosia_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('ambrosia_device_id', id)
  }
  return id
}
