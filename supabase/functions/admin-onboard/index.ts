import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // REMOVED website_url from here
    const { 
      email, password, full_name, org_name, city, phone, 
      designer_type, experience_years, bio, about_text, 
      logo_url, is_verified, featured_status 
    } = await req.json()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email, password: password, email_confirm: true,
      user_metadata: { full_name: full_name, phone: phone, city: city }
    })

    if (authError) throw authError

    if (authData.user) {
      await supabaseAdmin.from('users').update({ 
        role: 'designer', full_name: full_name, phone: phone, city: city
      }).eq('id', authData.user.id)

      const { error: dbError } = await supabaseAdmin.from('designers').insert({
        user_id: authData.user.id,
        email, name: org_name, city, phone, 
        designer_type, experience_years, bio, about_text, logo_url, is_verified, featured_status
      }) // REMOVED website_url from insert

      if (dbError) throw dbError
    }

    return new Response(JSON.stringify({ success: true, user: authData?.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})