import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Headphones,
  Check
} from 'lucide-react';
import { SUPPORTED_STATES } from '../data/locations';
import { useLanguage } from '../context/LanguageContext';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Assam');
  const [message, setMessage] = useState('');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: t('faq_1_q', 'Does MistriKhoj charge any booking commission or hidden platform fee?'),
      a: t('faq_1_a', 'No! MistriKhoj is an open discovery platform with 0% commission on customer bookings. You directly call or WhatsApp the technician and settle payment directly with them after work inspection.')
    },
    {
      q: t('faq_2_q', 'How does MistriKhoj verify technicians and ensure home safety?'),
      a: t('faq_2_a', 'Every registered mistri submits their Government Aadhaar card, trade certificate or ITI license, and local police verification. Only technicians passing our strict 4-Pillar Verification Matrix receive the active Verified Ustad badge.')
    },
    {
      q: t('faq_3_q', 'Which states and cities are currently covered?'),
      a: t('faq_3_a', 'We currently cover 8 states: Arunachal Pradesh, Assam, Maharashtra, Meghalaya, Nagaland, Rajasthan, Uttar Pradesh, and West Bengal, including over 50 major cities and regional towns.')
    },
    {
      q: t('faq_4_q', 'How can a technician or contractor register on MistriKhoj?'),
      a: t('faq_4_a', 'Simply click the "Register as a Mistri" button at the top, fill in your trade category, phone number, qualification, experience, and upload your profile photo and work gallery. Registration offers a 30-Day Free Starter Trial!')
    },
    {
      q: t('faq_5_q', 'What should I do in an emergency electrical or plumbing breakdown?'),
      a: t('faq_5_a', 'Use our 24/7 Emergency SOS toggle in the search directory to find immediately available on-call technicians who can reach your home in 15-30 minutes.')
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setFormSubmitted(true);
  };

  return (
    <section id="contact-section" className="py-16 sm:py-24 bg-[#FAFAFA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
              {t('contact_badge', 'DIRECT SUPPORT')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight">
            {t('contact_title', 'Contact & Regional Support')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2.5 max-w-lg mx-auto leading-relaxed font-medium">
            {t('contact_subtitle', 'Have questions or need assistance finding a technician? Our regional coordination team is ready to help.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          
          {/* Left Column: Direct Info & Form */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="tel:18008896478"
                className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-black transition-all flex items-center gap-3 group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-black text-[#FFB800] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold">{t('contact_toll_free', 'Toll-Free Helpline')}</div>
                  <div className="text-xs font-black text-black">1800-889-MISTRI</div>
                </div>
              </a>

              <a
                href="https://wa.me/919876543210?text=Hello%20MistriKhoj,%20I%20need%20assistance%20finding%20a%20technician"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-[#25D366]/10 border-2 border-[#25D366]/40 hover:border-[#25D366] transition-all flex items-center gap-3 group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-800 font-bold">{t('contact_whatsapp', 'WhatsApp Support')}</div>
                  <div className="text-xs font-black text-emerald-900">+91 98765 43210</div>
                </div>
              </a>
            </div>

            {/* Contact Form Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-gray-200 shadow-sm">
              <div className="text-sm font-black text-black mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-black" />
                <span>{t('contact_form_title', 'Send Direct Inquiry to Support')}</span>
              </div>

              {formSubmitted ? (
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div className="text-base font-black text-black">{t('contact_success_title', 'Message Received!')}</div>
                  <p className="text-xs text-gray-700">
                    {t('contact_success_desc', 'Thank you. Our regional coordinator will contact you shortly.')}
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setName('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="mt-2 text-xs font-bold text-black underline"
                  >
                    {t('contact_another_inquiry', 'Send another inquiry')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        {t('contact_name_label', 'Full Name *')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Sen"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black focus:border-black focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        {t('contact_phone_label', 'Phone Number *')}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black focus:border-black focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      {t('contact_state_label', 'Your State')}
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-black focus:border-black focus:outline-none"
                    >
                      {SUPPORTED_STATES.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      {t('contact_msg_label', 'Message / Requirement Details')}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what kind of service technician or assistance you require..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black focus:border-black focus:outline-none resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-black hover:bg-gray-800 text-[#FFB800] text-xs font-black tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('contact_btn_send', 'Send Message to Coordinator')}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Column: FAQs Accordion & Regional Hubs */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-gray-200 shadow-sm">
              <div className="text-sm font-black text-black mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-black" />
                <span>{t('contact_faq_title', 'Frequently Asked Questions')}</span>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                        className="w-full p-3.5 text-left text-xs font-bold text-black flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-black shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-200">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional Support Hubs */}
            <div className="p-6 rounded-2xl bg-white border-2 border-gray-200 shadow-sm">
              <div className="text-xs font-black text-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-black" />
                <span>{t('contact_offices_title', 'Regional Verification Offices')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-black">Guwahati</div>
                  <div className="text-[10px] text-gray-500">Zoo Road, Assam</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-black">Mumbai / Pune</div>
                  <div className="text-[10px] text-gray-500">Kothrud & Ghatkopar</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-black">Jaipur</div>
                  <div className="text-[10px] text-gray-500">Mansarovar, RJ</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-black">Lucknow</div>
                  <div className="text-[10px] text-gray-500">Chowk Market, UP</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-black">Kolkata</div>
                  <div className="text-[10px] text-gray-500">Gariahat, WB</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-black">Shillong / Itanagar</div>
                  <div className="text-[10px] text-gray-500">Mawlai & E-Sector</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
