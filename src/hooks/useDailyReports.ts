// ====================================================================
// AyurDesk - useDailyReports Hook
// Operations tracking with PostgreSQL Row Level Security
// ====================================================================

import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DailyReport } from '../types';
import { useAuth } from '../context/AuthContext';
import { INITIAL_RECORDS } from '../lib/seedData';

export interface UseDailyReportsFilter {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useDailyReports(initialFilter?: UseDailyReportsFilter) {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(
    async (filter?: UseDailyReportsFilter) => {
      setLoading(true);
      setError(null);

      // If Supabase credentials are not yet configured, load local seed records as preview
      if (!isSupabaseConfigured) {
        console.info('[AyurDesk] Supabase not connected. Displaying verified local seed dataset.');
        const mockReports: DailyReport[] = INITIAL_RECORDS.map((r, i) => ({
          id: `seed-${i + 1}`,
          report_date: r.report_date,
          total_enquiries: r.total_enquiries,
          total_responses: r.total_responses,
          total_confirmations: r.total_confirmations,
          total_bookings: r.total_bookings,
          tomorrow_bookings: r.tomorrow_bookings,
          whatsapp_calls_messages: r.whatsapp_calls_messages,
          normal_calls: r.normal_calls,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setReports(mockReports);
        setLoading(false);
        return mockReports;
      }

      try {
        let query = supabase
          .from('daily_reports')
          .select('*')
          .order('report_date', { ascending: false });

        if (filter?.startDate) {
          query = query.gte('report_date', filter.startDate);
        }
        if (filter?.endDate) {
          query = query.lte('report_date', filter.endDate);
        }
        if (filter?.limit) {
          query = query.limit(filter.limit);
        }

        const { data, error: fetchErr } = await query;

        if (fetchErr) {
          setError(fetchErr.message);
          return [];
        }

        const res = (data as DailyReport[]) || [];
        setReports(res);
        return res;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch reports';
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchReports(initialFilter);
  }, [fetchReports, initialFilter?.startDate, initialFilter?.endDate, initialFilter?.limit]);

  // Save (Insert or Upsert) Daily Report
  const saveReport = async (reportData: {
    report_date: string;
    total_enquiries: number | null;
    total_responses: number | null;
    total_confirmations: number | null;
    total_bookings: number | null;
    tomorrow_bookings: number | null;
    whatsapp_calls_messages: number | null;
    normal_calls: number | null;
  }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase database credentials are not configured.');
    }

    const payload = {
      ...reportData,
      created_by: user?.id,
      updated_by: user?.id,
    };

    const { data, error } = await supabase
      .from('daily_reports')
      .upsert(payload, { onConflict: 'report_date' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchReports(initialFilter);
    return data as DailyReport;
  };

  // Update existing Daily Report
  const updateReport = async (
    id: string,
    updates: Partial<DailyReport>
  ) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase database credentials are not configured.');
    }

    const payload = {
      ...updates,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('daily_reports')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchReports(initialFilter);
    return data as DailyReport;
  };

  // Delete record (Admin only)
  const deleteReport = async (id: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase database credentials are not configured.');
    }

    const { error } = await supabase.from('daily_reports').delete().eq('id', id);

    if (error) {
      throw error;
    }

    await fetchReports(initialFilter);
  };

  return {
    reports,
    loading,
    error,
    refetch: () => fetchReports(initialFilter),
    fetchReports,
    saveReport,
    updateReport,
    deleteReport,
  };
}
