import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { Users, Shield, Building, UserPlus, Lock, Key, Activity, CheckCircle2 } from 'lucide-react';

export function OrganizationPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'Members' | 'Roles' | 'Activity'>('Members');

  const [orgInfo, setOrgInfo] = useState({
    name: 'TrustRide Commercial Fleet Co-operative',
    fleetSize: 5,
    totalUsers: 42,
    securityOfficers: 4,
    operationsManagers: 6,
    drivers: 25,
    status: 'Active Enterprise Account',
  });

  const [users, setUsers] = useState([
    { id: 'U1', name: 'Sarah Kim', role: 'Security Officer', dept: 'Cybersecurity SOC', status: 'Active', email: 'sarah.kim@trustride.io', phone: '+91 98765 11111' },
    { id: 'U2', name: 'Aisha Khan', role: 'Operations Manager', dept: 'Fleet Operations', status: 'Active', email: 'aisha.khan@trustride.io', phone: '+91 98765 22222' },
    { id: 'U3', name: 'Vikram Singh', role: 'Super Admin', dept: 'Executive', status: 'Active', email: 'vikram.singh@trustride.io', phone: '+91 98765 33333' },
    { id: 'U4', name: 'Rajesh Kumar', role: 'Driver', dept: 'Logistics', status: 'Available', email: 'rajesh.kumar@trustride.io', phone: '+91 98765 43210' },
  ]);

  const [roles, setRoles] = useState([
    { role: 'Super Admin', permissions: ['Full System Access', 'User Management', 'Security Overrides', 'Key Rotation'] },
    { role: 'Security Officer', permissions: ['Co-Signature Quorum', 'Threat Sandbox Access', 'Audit Ledger Inspection'] },
    { role: 'Operations Manager', permissions: ['Command Creation', 'Fleet Monitoring', 'Driver Dispatch'] },
    { role: 'Fleet Manager', permissions: ['Vehicle Status Overview', 'Route Management', 'Maintenance Requests'] },
    { role: 'Driver', permissions: ['Driver Telemetry View', 'Dispute Submission', 'Status Notification'] },
    { role: 'Viewer', permissions: ['Read-Only Executive Dashboard'] },
  ]);

  const [activities, setActivities] = useState([
    { id: 'ACT-01', user: 'Sarah Kim', action: 'Co-Signed Command APP-1004', module: 'Approval Center', date: '2026-08-06 18:42', result: 'Approved' },
    { id: 'ACT-02', user: 'Aisha Khan', action: 'Created Command CMD-1045', module: 'Command Center', date: '2026-08-06 18:40', result: 'Submitted' },
    { id: 'ACT-03', user: 'System', action: 'Replay Attack Simulated & Blocked', module: 'Threat Sandbox', date: '2026-08-06 18:35', result: 'Blocked' },
    { id: 'ACT-04', user: 'Vikram Singh', action: 'Audit Block #154 Verified', module: 'Audit Ledger', date: '2026-08-06 17:50', result: 'Valid' },
  ]);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const [resO, resU, resR, resA] = await Promise.all([
          fetch('/api/organization'),
          fetch('/api/users'),
          fetch('/api/roles'),
          fetch('/api/activity'),
        ]);

        if (resO.ok) setOrgInfo(await resO.json());
        if (resU.ok) setUsers(await resU.json());
        if (resR.ok) setRoles(await resR.json());
        if (resA.ok) setActivities(await resA.json());
      } catch {
        // Fallback
      }
    };
    fetchOrgData();
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Organization & Governance
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Team permissions, role-based access control (RBAC), and enterprise user management
          </p>
        </div>
        <button
          onClick={() => alert('Invite User Modal Opened')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
        >
          <UserPlus size={14} />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* TOP SUMMARY CARDS (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono text-xs">
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Organization</div>
          <div className={`text-xs font-bold mt-1 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{orgInfo.name}</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Fleet Size</div>
          <div className="text-xl font-extrabold text-blue-500 mt-0.5">{orgInfo.fleetSize} EVs</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Users</div>
          <div className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{orgInfo.totalUsers} Members</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Security Officers</div>
          <div className="text-xl font-extrabold text-emerald-500 mt-0.5">{orgInfo.securityOfficers} Officers</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Ops Managers</div>
          <div className="text-xl font-extrabold text-purple-500 mt-0.5">{orgInfo.operationsManagers} Ops</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Drivers</div>
          <div className="text-xl font-extrabold text-amber-500 mt-0.5">{orgInfo.drivers} Drivers</div>
        </div>
      </div>

      {/* TABS BAR */}
      <div className={`p-3.5 rounded-lg border flex items-center space-x-2 ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        {(['Members', 'Roles', 'Activity'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MEMBERS TABLE */}
      {activeTab === 'Members' && (
        <div className={`p-5 rounded-lg border shadow-xs space-y-4 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span>Team Members Directory ({users.length} Active Users)</span>
            <span className="text-emerald-500 font-mono text-[11px]">RBAC Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {users.map((u) => (
                  <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="p-3 font-bold text-blue-500">{u.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/30">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.dept}</td>
                    <td className={`p-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{u.email}</td>
                    <td className="p-3 text-slate-400">{u.phone}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'Roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div key={r.role} className={`p-5 rounded-lg border shadow-xs space-y-3 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
              <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.role}</h3>
                <Shield size={16} className="text-blue-500" />
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {r.permissions.map((perm) => (
                  <div key={perm} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ORGANIZATION ACTIVITY LOG */}
      {activeTab === 'Activity' && (
        <div className={`p-5 rounded-lg border shadow-xs space-y-4 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 border-slate-200 dark:border-slate-800">
            Organization Audit & Governance Activity Trail
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {activities.map((a) => (
                  <tr key={a.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="p-3 font-bold text-blue-500">{a.user}</td>
                    <td className={`p-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{a.action}</td>
                    <td className="p-3 text-purple-400">{a.module}</td>
                    <td className="p-3 text-slate-400">{a.date}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        {a.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default OrganizationPage;
