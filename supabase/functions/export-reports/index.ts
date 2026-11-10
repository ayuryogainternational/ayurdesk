// ====================================================================
// AyurDesk - Daily Operations Management System
// Supabase Edge Function: export-reports
// Enforces Server-Side Admin Authorization for Report Generation
// Organization: Ayuryoga International
// ====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ExportRequestBody {
  scope: "single" | "range" | "daily" | "weekly" | "monthly";
  singleDate?: string;
  startDate?: string;
  endDate?: string;
}

serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Missing Authorization header",
          code: "UNAUTHORIZED",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Client with caller's token to get authenticated user
    const clientUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await clientUser.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Invalid or expired authentication token",
          code: "INVALID_TOKEN",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Service Role to securely verify role from profiles table
    const adminDb = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile, error: profileError } = await adminDb
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          error: "User profile not found",
          code: "PROFILE_NOT_FOUND",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ====================================================================
    // CRITICAL BACKEND SECURITY ENFORCEMENT
    // Staff (e.g. Shilpa, Gokul) are strictly forbidden from exporting.
    // ====================================================================
    if (profile.role !== "admin") {
      return new Response(
        JSON.stringify({
          error: "Forbidden: Staff accounts are strictly prohibited from exporting reports. Administrator privileges are required.",
          code: "FORBIDDEN_STAFF_EXPORT",
          user: profile.full_name,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: ExportRequestBody = await req.json();
    const { scope, singleDate, startDate, endDate } = body;

    let query = adminDb
      .from("daily_reports")
      .select(`
        id,
        report_date,
        total_enquiries,
        total_responses,
        total_confirmations,
        total_bookings,
        tomorrow_bookings,
        whatsapp_calls_messages,
        normal_calls,
        created_at,
        updated_at
      `)
      .order("report_date", { ascending: true });

    if (scope === "single" && singleDate) {
      query = query.eq("report_date", singleDate);
    } else if (scope === "daily" && singleDate) {
      query = query.eq("report_date", singleDate);
    } else if (startDate && endDate) {
      query = query.gte("report_date", startDate).lte("report_date", endDate);
    } else if (startDate) {
      query = query.gte("report_date", startDate);
    }

    const { data: records, error: recordsError } = await query;

    if (recordsError) {
      return new Response(
        JSON.stringify({ error: recordsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Compute Mauritius local timestamp
    // Indian Ocean/Mauritius is UTC+4
    const now = new Date();
    const mauritiusTimeStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Indian/Mauritius",
      dateStyle: "full",
      timeStyle: "medium",
    }).format(now);

    return new Response(
      JSON.stringify({
        success: true,
        authorizedAdmin: {
          id: user.id,
          name: profile.full_name,
          email: profile.email,
        },
        organization: "Ayuryoga International",
        platform: "AyurDesk",
        timezone: "Indian Ocean/Mauritius (UTC+04:00)",
        generationTimeMauritius: mauritiusTimeStr,
        generationTimestamp: now.toISOString(),
        scope,
        period: {
          singleDate: singleDate || null,
          startDate: startDate || null,
          endDate: endDate || null,
        },
        recordCount: records ? records.length : 0,
        records: records || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
