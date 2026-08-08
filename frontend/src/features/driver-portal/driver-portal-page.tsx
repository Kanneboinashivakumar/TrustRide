import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Battery, Lock, Phone, Car, Bell, Clock, FileText, AlertCircle } from 'lucide-react';

import { useAuth } from '@/providers/auth-provider';

export function DriverPortalPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const isDark = resolvedTheme === 'dark';

  const [driver, setDriver] = useState({
    id: user?.id || 'D-01',
    name: user?.name || 'Rajesh Kumar',
    employeeId: user?.employeeId || 'EMP-9982',
    phone: user?.phone || '+91 98765 43210',
    licenseNumber: 'MH12-2021-00821',
    assignedVehicle: 'TR-101',
    status: 'Available',
    avatar: user?.avatar || user?.profilePhoto || 'RK',
  });

  useEffect(() => {
    if (user) {
      setDriver((prev) => ({
        ...prev,
        id: user.id || prev.id,
        name: user.name || prev.name,
        employeeId: user.employeeId || prev.employeeId,
        phone: user.phone || prev.phone,
        avatar: user.avatar || user.profilePhoto || prev.avatar,
      }));
    }
  }, [user]);

  const [vehicle, setVehicle] = useState({
    id: 'TR-101',
    name: 'Sargam Electric Rickshaw',
    plate: 'MH-12-ER-1001',
    battery: 85,
    speed: 18,
    location: 'Ameerpet, Hyderabad',
    status: 'active',
    doors: 'Locked',
    ignition: 'On',
    charging: 'Disconnected',
    connection: '4G LTE Connected',
    lastUpdated: 'Just now',
  });

  const [notifications, setNotifications] = useState([
    { id: 'N1', title: 'Vehicle Immobilization Check', desc: 'Remote safety diagnostic initiated by Fleet Control.', time: '10 min ago' },
    { id: 'N2', title: 'Firmware Update Installed', desc: 'ECU Firmware v2.4.1 patch applied successfully.', time: '1 hour ago' },
    { id: 'N3', title: 'Maintenance Scheduled', desc: 'Routine 10,000 km battery cell inspection set for Aug 10.', time: '1 day ago' },
  ]);

  const [history, setHistory] = useState([
    { date: '2026-08-06 18:42', command: 'ECDSA Signature Check', requestedBy: 'Security Admin', status: 'Executed' },
    { date: '2026-08-06 17:10', command: 'OTA Firmware Sync v2.4.1', requestedBy: 'System Auto', status: 'Executed' },
    { date: '2026-08-05 14:20', command: 'Battery Cell Balancing', requestedBy: 'Ops Manager', status: 'Completed' },
  ]);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const [resMe, resV, resH, resN] = await Promise.all([
          fetch('/api/driver/me'),
          fetch('/api/driver/vehicle'),
          fetch('/api/driver/history'),
          fetch('/api/driver/notifications'),
        ]);

        if (resMe.ok) setDriver(await resMe.json());
        if (resV.ok) setVehicle(await resV.json());
        if (resH.ok) setHistory(await resH.json());
        if (resN.ok) setNotifications(await resN.json());
      } catch {
        // Fallback
      }
    };
    fetchDriverData();
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Driver Portal
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Assigned vehicle status, remote command alerts, and driver authorization portal
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
            <Shield size={14} />
            <span>DRIVER AUTHORIZED</span>
          </span>
        </div>
      </div>

      {/* TOP ROW: DRIVER PROFILE & ASSIGNED VEHICLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DRIVER PROFILE CARD */}
        <div className={`p-5 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex items-center space-x-4 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-lg bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center border border-blue-500">
              {driver.avatar}
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{driver.name}</h2>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">ID: {driver.employeeId} • Lic: {driver.licenseNumber}</div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                {driver.status}
              </span>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-slate-500">Phone:</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{driver.phone}</div>
            </div>
            <div>
              <div className="text-slate-500">Assigned EV:</div>
              <div className="font-bold text-blue-500">{driver.assignedVehicle}</div>
            </div>
          </div>
        </div>

        {/* ASSIGNED VEHICLE CARD */}
        <div className={`p-5 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex justify-between items-start border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-blue-500 uppercase">Assigned EV</span>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.name}</h2>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">Plate: {vehicle.plate} • Location: {vehicle.location}</div>
            </div>
            <button
              onClick={() => navigate('/app/digital-twin?vehicleId=' + vehicle.id)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
            >
              View Vehicle
            </button>
          </div>

          <div className="pt-4 grid grid-cols-3 gap-2 text-xs font-mono">
            <div className={`p-2.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] text-slate-500">BATTERY</div>
              <div className="font-bold text-emerald-500">{vehicle.battery}%</div>
            </div>
            <div className={`p-2.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] text-slate-500">SPEED</div>
              <div className="font-bold text-blue-500">{vehicle.speed} km/h</div>
            </div>
            <div className={`p-2.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] text-slate-500">STATUS</div>
              <div className="font-bold text-emerald-500 uppercase">{vehicle.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT VEHICLE STATUS CARDS (Grid of 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Door Status</div>
          <div className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.doors}</div>
        </div>
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Ignition</div>
          <div className="text-sm font-bold text-emerald-500 mt-1">{vehicle.ignition}</div>
        </div>
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Charging</div>
          <div className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.charging}</div>
        </div>
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Cellular</div>
          <div className="text-sm font-bold text-blue-500 mt-1">{vehicle.connection}</div>
        </div>
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Security Interlock</div>
          <div className="text-sm font-bold text-emerald-500 mt-1">Active</div>
        </div>
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Last Updated</div>
          <div className="text-xs font-mono text-slate-400 mt-1">{vehicle.lastUpdated}</div>
        </div>
      </div>

      {/* DRIVER NOTIFICATIONS & COMMAND HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Driver Notifications (Left 5 cols) */}
        <div className={`lg:col-span-5 p-5 rounded-lg border shadow-xs space-y-3 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span>Driver Notifications & Remote Alerts</span>
            <Bell size={14} className="text-blue-500" />
          </div>
          <div className="space-y-2 text-xs">
            {notifications.map((n) => (
              <div key={n.id} className={`p-3 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center font-bold">
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Command History Table (Right 7 cols) */}
        <div className={`lg:col-span-7 p-5 rounded-lg border shadow-xs space-y-3 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 border-slate-200 dark:border-slate-800">
            Assigned Vehicle Command History
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Command</th>
                  <th className="p-2.5">Requested By</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {history.map((h, i) => (
                  <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="p-2.5 text-slate-400">{h.date}</td>
                    <td className="p-2.5 font-bold text-blue-500">{h.command}</td>
                    <td className="p-2.5">{h.requestedBy}</td>
                    <td className="p-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EMERGENCY CONTACT CARD */}
      <div className={`p-4 rounded-lg border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <Phone size={20} className="text-rose-500" />
          <div>
            <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Emergency Dispatch & Fleet Control Support</div>
            <div className="text-[11px] text-slate-500">24/7 SOC Toll-Free: +91 1800-TR-ROADSIDE (1800-877-6237)</div>
          </div>
        </div>
        <button
          onClick={() => alert('Dialing Fleet Control Emergency Helpline...')}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
        >
          Call Emergency Support
        </button>
      </div>
    </motion.div>
  );
}

export default DriverPortalPage;
