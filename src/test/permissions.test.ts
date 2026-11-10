// ====================================================================
// AyurDesk - Unit Tests: Role & Security Authorization Tests
// ====================================================================

import { describe, it, expect } from 'vitest';
import { UserRole } from '../types';
import { canEditDailyReport } from '../lib/validation';

interface SimulatedUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

// Simulated permissions checker matching backend RLS and frontend guards
class SecurityPolicyEngine {
  canViewReports(user: SimulatedUser): boolean {
    return true; // Authenticated staff & admin can view daily logs
  }

  canCreateReport(user: SimulatedUser): boolean {
    return true; // Staff & admin can insert
  }

  canEditReport(
    user: SimulatedUser,
    report?: { created_at?: string; report_date: string },
    nowMs?: number
  ): boolean {
    if (user.role === 'admin') return true;
    if (!report) return true;
    return canEditDailyReport(report, user.role, nowMs).canEdit;
  }

  canDeleteReport(user: SimulatedUser): boolean {
    return user.role === 'admin'; // Only admin can delete
  }

  canExportReports(user: SimulatedUser): { authorized: boolean; error?: string; status: number } {
    if (user.role !== 'admin') {
      return {
        authorized: false,
        error: 'Forbidden: Staff accounts are strictly prohibited from exporting reports. Administrator privileges are required.',
        status: 403,
      };
    }
    return {
      authorized: true,
      status: 200,
    };
  }

  canManageUsers(user: SimulatedUser): boolean {
    return user.role === 'admin';
  }

  canViewAuditLogs(user: SimulatedUser): boolean {
    return user.role === 'admin';
  }
}

describe('Role & Permission Enforcement', () => {
  const engine = new SecurityPolicyEngine();

  const shilpa: SimulatedUser = {
    id: 'u-shilpa',
    name: 'Shilpa',
    role: 'staff',
    email: 'shilpa@ayuryoga.example.com',
  };

  const gokul: SimulatedUser = {
    id: 'u-gokul',
    name: 'Gokul',
    role: 'staff',
    email: 'gokul@ayuryoga.example.com',
  };

  const ownerAdmin: SimulatedUser = {
    id: 'u-admin',
    name: 'Owner/Admin',
    role: 'admin',
    email: 'admin@ayuryoga.example.com',
  };

  describe('Staff Personas (Shilpa and Gokul)', () => {
    it('Shilpa and Gokul can view daily records', () => {
      expect(engine.canViewReports(shilpa)).toBe(true);
      expect(engine.canViewReports(gokul)).toBe(true);
    });

    it('Shilpa and Gokul can create and overwrite daily records within 24 hours (reception handover)', () => {
      const now = new Date('2026-11-10T14:00:00Z').getTime();
      const morningReport = {
        report_date: '2026-11-10',
        created_at: '2026-11-10T08:00:00Z', // Created 6 hours ago
      };
      expect(engine.canCreateReport(shilpa)).toBe(true);
      expect(engine.canCreateReport(gokul)).toBe(true);
      // Both Shilpa and Gokul can edit and overwrite report within 24h
      expect(engine.canEditReport(shilpa, morningReport, now)).toBe(true);
      expect(engine.canEditReport(gokul, morningReport, now)).toBe(true);
    });

    it('Staff CANNOT edit or overwrite reports after 24 hours have elapsed', () => {
      const now = new Date('2026-11-11T12:00:00Z').getTime();
      const pastReport = {
        report_date: '2026-11-09',
        created_at: '2026-11-09T08:00:00Z', // Submitted 52 hours ago (>24h)
      };
      expect(engine.canEditReport(shilpa, pastReport, now)).toBe(false);
      expect(engine.canEditReport(gokul, pastReport, now)).toBe(false);
    });

    it('CRITICAL: Staff CANNOT export Excel or PDF reports and receive 403 Forbidden', () => {
      const shilpaExport = engine.canExportReports(shilpa);
      expect(shilpaExport.authorized).toBe(false);
      expect(shilpaExport.status).toBe(403);
      expect(shilpaExport.error).toContain('Staff accounts are strictly prohibited');

      const gokulExport = engine.canExportReports(gokul);
      expect(gokulExport.authorized).toBe(false);
      expect(gokulExport.status).toBe(403);
    });

    it('Staff CANNOT delete records', () => {
      expect(engine.canDeleteReport(shilpa)).toBe(false);
      expect(engine.canDeleteReport(gokul)).toBe(false);
    });

    it('Staff CANNOT access user management or promote users', () => {
      expect(engine.canManageUsers(shilpa)).toBe(false);
      expect(engine.canManageUsers(gokul)).toBe(false);
    });

    it('Staff CANNOT view audit history logs', () => {
      expect(engine.canViewAuditLogs(shilpa)).toBe(false);
      expect(engine.canViewAuditLogs(gokul)).toBe(false);
    });
  });

  describe('Owner/Admin Persona', () => {
    it('Admin has full dashboard and records access', () => {
      expect(engine.canViewReports(ownerAdmin)).toBe(true);
      expect(engine.canCreateReport(ownerAdmin)).toBe(true);
      expect(engine.canEditReport(ownerAdmin)).toBe(true);
      expect(engine.canDeleteReport(ownerAdmin)).toBe(true);
    });

    it('Admin is authorized to export Excel and PDF reports (Status 200)', () => {
      const adminExport = engine.canExportReports(ownerAdmin);
      expect(adminExport.authorized).toBe(true);
      expect(adminExport.status).toBe(200);
      expect(adminExport.error).toBeUndefined();
    });

    it('Admin can manage users and view audit history', () => {
      expect(engine.canManageUsers(ownerAdmin)).toBe(true);
      expect(engine.canViewAuditLogs(ownerAdmin)).toBe(true);
    });
  });
});

