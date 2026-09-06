import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { SUPPORTED_STATES } from '../data/locations';
import { useLanguage } from '../context/LanguageContext';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmergencyCategory: (category: string) => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  onSelectEmergencyCategory
}) => {
  const { t } = useLanguage();
  const [selectedEmergency, setSelectedEmergency] = useState('Short Circuit & Sparking');
  const [sosState, setSosState] = useState('Assam');
  const [sosCity, setSosCity] = useState('Guwahati');
  const [sosPhone, setSosPhone] = useState('');
  const [sosSubmitted, setSosSubmitted] = useState(false);

  if (!isOpen) return null;

  const emergencyOptions = [
    { label: t('sos_opt_1', 'Short Circuit & Sparking / Power Cut'), category: t('cat_electrician', 'Electrician') },
    { label: t('sos_opt_2', 'Burst Pipe / Major Water Flooding'), category: t('cat_plumber', 'Plumber') },
    { label: t('sos_opt_3', 'AC Burning Smell / Heavy Leakage'), category: t('cat_appliance', 'AC & Appliance Repair') },
    { label: t('sos_opt_4', 'Broken Main Gate / Security Door Lock'), category: t('cat_carpenter', 'Carpenter') },
    { label: t('sos_opt_5', 'Roadside Breakdown / Vehicle Stall'), category: t('cat_mechanic', 'Auto & Two-Wheeler Mechanic') }
  ];

  const handleSosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosPhone) return;
    setSosSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      
      <div className="relative w-full max-w-lg bg-white border-2 border-black rounded-2xl shadow-2xl overflow-hidden text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#0D0F12] text-white border-b border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB800] text-black flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-black text-black" />
            </div>
            <div>
              <div className="text-xs font-black text-[#FFB800] uppercase tracking-wider">
                {t('sos_title', '24/7 Emergency SOS Line')}
              </div>
              <div className="text-xs text-gray-300">{t('sos_subtitle', 'Fast-Track 15-Minute Technician Dispatch')}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {sosSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-black">{t('sos_sent_title', 'SOS Broadcast Sent!')}</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
                {t('sos_sent_desc', 'Nearby emergency on-call ustads in')} <strong className="text-black">{sosCity}, {sosState}</strong> {t('sos_sent_notified', 'have been notified. An on-duty technician will call')} <strong className="text-black">{sosPhone}</strong> {t('sos_sent_time', 'within 3-5 minutes.')}
              </p>
              
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1">
                <div className="font-bold text-amber-900">{t('sos_backup_title', 'Direct Helpline Backup:')}</div>
                <div className="text-amber-800">{t('sos_backup_desc', 'If you do not receive a call within 5 minutes, dial Toll-Free:')} <strong className="font-bold">1800-889-6478</strong></div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-black text-[#FFB800] font-bold text-xs hover:bg-gray-900 transition-colors cursor-pointer"
              >
                {t('sos_return_btn', 'Close & Return to Directory')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSosSubmit} className="space-y-4">
              
              {/* Emergency issue selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t('sos_select_type', 'Select Urgent Breakdown Type')}
                </label>
                <div className="space-y-1.5">
                  {emergencyOptions.map((opt) => (
                    <label
                      key={opt.label}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedEmergency === opt.label
                          ? 'border-black bg-amber-50 font-bold text-black'
                          : 'border-gray-200 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="emergency"
                          checked={selectedEmergency === opt.label}
                          onChange={() => setSelectedEmergency(opt.label)}
                          className="text-black focus:ring-0"
                        />
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        {opt.category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* State & City Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t('contact_state_label', 'State')}
                  </label>
                  <select
                    value={sosState}
                    onChange={(e) => setSosState(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:border-black focus:outline-none"
                  >
                    {SUPPORTED_STATES.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t('sos_city_label', 'City / Area')}
                  </label>
                  <input
                    type="text"
                    required
                    value={sosCity}
                    onChange={(e) => setSosCity(e.target.value)}
                    placeholder="e.g. Guwahati"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {t('sos_phone_label', 'Your Phone Number (For Immediate Callback)')}
                </label>
                <div className="flex">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={sosPhone}
                    onChange={(e) => setSosPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-r-xl text-xs font-semibold text-gray-900 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{t('sos_btn_dispatch', 'Request Instant 15-Min Ustad Dispatch')}</span>
                </button>
              </div>

              {/* Direct call option */}
              <div className="text-center pt-2">
                <a
                  href="tel:18008896478"
                  className="text-xs font-bold text-gray-600 hover:text-black flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-black" />
                  <span>{t('sos_call_desk', 'Or call 24x7 SOS Desk: 1800-889-6478')}</span>
                </a>
              </div>

            </form>
          )}
        </div>

      </div>

    </div>
  );
};
