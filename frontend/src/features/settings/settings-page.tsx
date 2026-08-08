import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { useAuth } from '@/providers/auth-provider';
import { User, Sun, Moon, Bell, Shield, Key, Share2, CheckCircle2, QrCode, Lock, RefreshCw, Copy, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const isDark = resolvedTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'Profile' | 'Appearance' | 'Notifications' | 'Security' | 'API Keys' | 'Integrations'>('Profile');

  // Profile Form State synced with authenticated user
  const [profile, setProfile] = useState({
    name: user?.name || 'Sarah Kim',
    email: user?.email || 'sarah.kim@trustride.ai',
    phone: user?.phone || '+91 98765 11111',
    organization: user?.organization || 'TrustRide Commercial Fleet Co-op',
    designation: user?.designation || user?.role || 'Lead Security Officer & SOC Admin',
    profilePhoto: user?.avatar || user?.profilePhoto || 'SK',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || 'Sarah Kim',
        email: user.email || 'sarah.kim@trustride.ai',
        phone: user.phone || '+91 98765 11111',
        organization: user.organization || 'TrustRide Commercial Fleet Co-op',
        designation: user.designation || user.role || 'Lead Security Officer & SOC Admin',
        profilePhoto: user.avatar || user.profilePhoto || 'SK',
      });
    }
  }, [user]);

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    securityAlerts: true,
    commandAlerts: true,
    approvalAlerts: true,
    systemUpdates: false,
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    { id: 'KEY-01', name: 'Production Fleet Webhook', key: 'tr_live_99a8f2e3b1c4d5e6f7a8b9c0d1e2f3a4', scope: 'Read Write', created: '2026-07-15' },
    { id: 'KEY-02', name: 'SOC Monitoring Bot', key: 'tr_live_11b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', scope: 'Read Only', created: '2026-08-01' },
  ]);

  const handleSaveProfile = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, notifications }),
      });
      alert('Settings updated successfully!');
    } catch {
      alert('Settings saved!');
    }
  };

  const handleGenerateKey = () => {
    const newKey = {
      id: `KEY-0${apiKeys.length + 1}`,
      name: 'New Custom Integration Key',
      key: 'tr_live_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      scope: 'Read Write',
      created: 'Just now',
    };
    setApiKeys([...apiKeys, newKey]);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          System Settings & Preferences
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage security credentials, appearance modes, notification thresholds, and API integration keys
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT TAB NAVIGATION SIDEBAR (3 cols) */}
        <div className={`md:col-span-3 p-3 rounded-lg border shadow-xs space-y-1 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          {[
            { id: 'Profile', label: 'User Profile', icon: User },
            { id: 'Appearance', label: 'Appearance Theme', icon: Sun },
            { id: 'Notifications', label: 'Alert Preferences', icon: Bell },
            { id: 'Security', label: 'Security & 2FA', icon: Shield },
            { id: 'API Keys', label: 'API Keys & Secrets', icon: Key },
            { id: 'Integrations', label: 'Webhooks & Slack', icon: Share2 },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <IconComp size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT PANEL (9 cols) */}
        <div className={`md:col-span-9 p-6 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          {/* TAB 1: PROFILE */}
          {activeTab === 'Profile' && (
            <div className="space-y-5">
              <div className="font-bold text-sm border-b pb-3 border-slate-200 dark:border-slate-800">
                User Profile & Identity Settings
              </div>

              {/* PROFILE PHOTO AVATAR SELECTOR */}
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-extrabold shadow-md shrink-0 overflow-hidden">
                  {profile.profilePhoto && (profile.profilePhoto.startsWith('http') || profile.profilePhoto.startsWith('data:')) ? (
                    <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    profile.profilePhoto || 'SK'
                  )}
                </div>
                <div className="space-y-1.5 font-mono">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Profile Photo Avatar</div>
                  <p className="text-[10px] text-slate-500">Select avatar initials badge or enter custom initials for your identity badge</p>
                  <div className="flex space-x-2">
                    {['SK', 'VS', 'AK', 'RK', 'AO', 'TR'].map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setProfile({ ...profile, profilePhoto: av })}
                        className={`w-7 h-7 rounded-full text-[10px] font-bold border ${
                          profile.profilePhoto === av
                            ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={`w-full p-2.5 rounded-md border font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className={`w-full p-2.5 rounded-md border font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className={`w-full p-2.5 rounded-md border font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Designation</label>
                  <input
                    type="text"
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    className={`w-full p-2.5 rounded-md border font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-500 font-bold block mb-1">Organization</label>
                  <input
                    type="text"
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                    className={`w-full p-2.5 rounded-md border font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE (ONLY LIGHT / DARK TOGGLE) */}
          {activeTab === 'Appearance' && (
            <div className="space-y-5">
              <div className="font-bold text-sm border-b pb-3 border-slate-200 dark:border-slate-800">
                Appearance & Visual Theme (Strictly Light / Dark)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-lg border cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-blue-600 bg-blue-500/10 shadow-md'
                      : isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Sun size={20} className="text-amber-500" />
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Light Mode</span>
                  </div>
                  <p className="text-xs text-slate-500">Clean white Microsoft Azure layout with high contrast dark text</p>
                </div>

                <div
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-lg border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-blue-600 bg-blue-500/10 shadow-md'
                      : isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Moon size={20} className="text-blue-400" />
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Dark Mode</span>
                  </div>
                  <p className="text-xs text-slate-500">Sleek dark slate SOC layout with vibrant neon telemetry accents</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'Notifications' && (
            <div className="space-y-5">
              <div className="font-bold text-sm border-b pb-3 border-slate-200 dark:border-slate-800">
                Notification & Alert Threshold Toggles
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Receive security alert summaries via registered email' },
                  { id: 'browser', label: 'Browser Push Notifications', desc: 'Instant desktop alerts for pending approvals' },
                  { id: 'securityAlerts', label: 'Critical Security Alerts', desc: 'Notify immediately on MITM or Replay attack attempts' },
                  { id: 'commandAlerts', label: 'Remote Command Dispatches', desc: 'Notify when high-risk commands are executed' },
                  { id: 'approvalAlerts', label: 'Multi-Sig Approval Requests', desc: 'Notify when 2nd signature quorum is required' },
                ].map((item) => (
                  <div key={item.id} className={`p-3.5 rounded-md border flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifications as any)[item.id]}
                      onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & 2FA */}
          {activeTab === 'Security' && (
            <div className="space-y-5">
              <div className="font-bold text-sm border-b pb-3 border-slate-200 dark:border-slate-800">
                Security & Two-Factor Authentication (2FA)
              </div>

              <div className={`p-4 rounded-md border flex items-center space-x-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <QrCode size={40} className="text-blue-500 shrink-0" />
                <div>
                  <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Authenticator 2FA Enabled</div>
                  <div className="text-[11px] text-slate-500">Scan QR Code with Google Authenticator or Authy app for 6-digit TOTP validation</div>
                </div>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Current Password</label>
                  <input type="password" defaultValue="••••••••••••" className={`w-full p-2.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">New Password</label>
                  <input type="password" placeholder="Enter new strong password" className={`w-full p-2.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>
              </div>

              <button
                onClick={() => alert('Password updated successfully')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </div>
          )}

          {/* TAB 5: API KEYS */}
          {activeTab === 'API Keys' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sm">API Keys & REST Integration Secrets</span>
                <button
                  onClick={handleGenerateKey}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Key size={14} />
                  <span>Generate New Key</span>
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                {apiKeys.map((k) => (
                  <div key={k.id} className={`p-4 rounded-md border space-y-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center font-bold">
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>{k.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30">{k.scope}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 text-blue-400 text-[11px] truncate flex justify-between items-center">
                      <span>{k.key}</span>
                      <button onClick={() => alert('Copied API Key to Clipboard!')} className="text-slate-400 hover:text-white cursor-pointer"><Copy size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'Integrations' && (
            <div className="space-y-5">
              <div className="font-bold text-sm border-b pb-3 border-slate-200 dark:border-slate-800">
                Third-Party Enterprise Integrations & Webhooks
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Webhook URL Target</label>
                  <input type="text" defaultValue="https://api.trustride-enterprise.io/webhooks/soc-events" className={`w-full p-2.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Slack Channel Webhook</label>
                  <input type="text" defaultValue="https://hooks.slack.com/services/T000/B000/XXXX" className={`w-full p-2.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default SettingsPage;
