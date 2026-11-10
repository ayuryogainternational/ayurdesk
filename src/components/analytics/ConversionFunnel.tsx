// ====================================================================
// AyurDesk - Conversion Funnel & Ratio Analysis
// Organization: Ayuryoga International
// ====================================================================

import React from 'react';
import { DailyReport } from '../../types';
import { ArrowDownRight, MessageSquare, PhoneCall, CheckCheck } from 'lucide-react';

interface ConversionFunnelProps {
  records: DailyReport[];
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ records }) => {
  let totalEnquiries = 0;
  let totalResponses = 0;
  let totalConfirmations = 0;
  let totalBookings = 0;
  let totalWhatsApp = 0;
  let totalNormal = 0;

  records.forEach((r) => {
    if (r.total_enquiries !== null) totalEnquiries += r.total_enquiries;
    if (r.total_responses !== null) totalResponses += r.total_responses;
    if (r.total_confirmations !== null) totalConfirmations += r.total_confirmations;
    if (r.total_bookings !== null) totalBookings += r.total_bookings;
    if (r.whatsapp_calls_messages !== null) totalWhatsApp += r.whatsapp_calls_messages;
    if (r.normal_calls !== null) totalNormal += r.normal_calls;
  });

  const responseRate = totalEnquiries > 0 ? (totalResponses / totalEnquiries) * 100 : 0;
  const bookingRate = totalResponses > 0 ? (totalBookings / totalResponses) * 100 : 0;
  const confirmationRate = totalBookings > 0 ? (totalConfirmations / totalBookings) * 100 : 0;

  const totalComms = totalWhatsApp + totalNormal;
  const whatsappShare = totalComms > 0 ? (totalWhatsApp / totalComms) * 100 : 0;
  const normalShare = totalComms > 0 ? (totalNormal / totalComms) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Funnel Conversion Ratios */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wider">
          Operations Conversion Efficiency
        </h4>

        <div className="space-y-3">
          {/* Response Ratio */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Response Rate (Responses / Enquiries)</span>
              <span className="font-mono font-bold text-forest-900">{responseRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-forest-900 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(responseRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Booking Conversion */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Booking Conversion (Bookings / Responses)</span>
              <span className="font-mono font-bold text-forest-700">{bookingRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-forest-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(bookingRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Confirmation Ratio */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Confirmation Ratio (Confirmations / Bookings)</span>
              <span className="font-mono font-bold text-emerald-700">{confirmationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(confirmationRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Communications Channel Share */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wider mb-3">
            Inbound Communications Channel Split
          </h4>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-950">{totalWhatsApp}</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                {whatsappShare.toFixed(1)}% of total traffic
              </div>
            </div>

            <div className="p-3 bg-forest-50 rounded-xl border border-forest-100">
              <div className="flex items-center gap-1.5 text-xs text-forest-800 font-medium mb-1">
                <PhoneCall className="w-3.5 h-3.5 text-forest-600" />
                <span>Normal Calls</span>
              </div>
              <div className="text-lg font-bold font-mono text-forest-950">{totalNormal}</div>
              <div className="text-[11px] text-forest-700 font-medium mt-0.5">
                {normalShare.toFixed(1)}% of total traffic
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Aggregate Inbound Volume:</span>
          <span className="font-mono font-bold text-slate-800">{totalComms} communications</span>
        </div>
      </div>
    </div>
  );
};

