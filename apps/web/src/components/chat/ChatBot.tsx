import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MessageCircle, Send, ChevronRight } from 'lucide-react';
import { prefersReducedMotion } from '@atlas-south/design-system';

// ─── Knowledge base ──────────────────────────────────────────────────────────

const SERVICES = [
  'Plumbing',
  'Electricals',
  'Reactive Maintenance',
  'Facilities Management',
  'Security Services',
  'Commercial Cleaning',
  'Corporate Catering',
  'Aviation Services',
  'Concierge Services',
  'Parking Lot Management',
];

interface FAQ {
  keywords: string[];
  answer: string;
}

const FAQS: FAQ[] = [
  {
    keywords: ['plumb', 'pipe', 'leak', 'drain', 'water'],
    answer:
      'Our plumbing team covers everything from emergency leak repairs and drain unblocking to full commercial fit-outs. We operate 24/7 for reactive call-outs across London and the South East.',
  },
  {
    keywords: ['electric', 'wiring', 'fuse', 'power', 'PAT'],
    answer:
      'Atlas South provides NICEIC-standard electrical services including periodic testing, PAT testing, rewiring, and emergency fault response — all fully certified.',
  },
  {
    keywords: ['clean', 'hygiene', 'janitorial', 'sanitise', 'sanitize'],
    answer:
      'Our commercial cleaning teams are deployed daily, weekly, or on an ad-hoc basis. We cover offices, retail environments, healthcare facilities, and more, using certified eco-friendly products.',
  },
  {
    keywords: ['security', 'guard', 'CCTV', 'access control', 'manned'],
    answer:
      "We provide SIA-licensed manned guarding, CCTV monitoring, access control installation, and key-holding services — tailored to your site's risk profile.",
  },
  {
    keywords: ['cater', 'food', 'canteen', 'restaurant', 'hospitality', 'meal'],
    answer:
      'Our corporate catering service runs from boardroom lunches to full staff canteen management. We source locally, cater for all dietary requirements, and provide trained front-of-house staff.',
  },
  {
    keywords: ['concierge', 'reception', 'front of house', 'front desk', 'visitor'],
    answer:
      "Atlas South's concierge team manages reception desks, visitor management systems, post handling, and building information services — projecting a professional first impression for your organisation.",
  },
  {
    keywords: ['parking', 'car park', 'vehicle', 'permit', 'enforcement'],
    answer:
      'We manage commercial car parks and parking areas — from permit schemes and enforcement to signage, access barriers, and EV charging coordination.',
  },
  {
    keywords: ['aviation', 'airport', 'aircraft', 'airside', 'ground handling'],
    answer:
      "Our aviation services team supports airside facilities management, ground-side cleaning, and specialist maintenance for aviation environments — meeting the sector's strict regulatory standards.",
  },
  {
    keywords: ['facilit', 'FM', 'building management', 'PPM', 'planned preventive'],
    answer:
      'Our Facilities Management offering brings all hard and soft services under one contract — a single point of contact for PPM schedules, reactive works, compliance reporting, and supplier management.',
  },
  {
    keywords: ['reactive', 'emergency', 'urgent', 'breakdown', 'repair', '24/7'],
    answer:
      'Atlas South operates a 24/7 reactive maintenance helpdesk. Once you call or submit a request, an engineer is dispatched — with response time SLAs agreed in your contract.',
  },
  {
    keywords: ['area', 'cover', 'location', 'where', 'london', 'surrey', 'kent'],
    answer:
      'We cover Central London, North London, East London, South East London, West London, and parts of Surrey and Kent. If your site is in Greater London or the Home Counties, we can almost certainly help — get in touch to confirm.',
  },
  {
    keywords: ['healthcare', 'hospital', 'clinic', 'NHS', 'care home'],
    answer:
      'We work extensively in healthcare environments — hospitals, GP surgeries, dental practices, and care homes — and all our teams are trained in infection control protocols and CQC compliance requirements.',
  },
  {
    keywords: ['education', 'school', 'university', 'college', 'campus'],
    answer:
      'Atlas South supports schools, colleges, and universities with cleaning, security, catering, and maintenance — with DBS-checked staff and scheduling that respects term times.',
  },
  {
    keywords: ['office', 'corporate', 'commercial', 'workplace'],
    answer:
      'From single-office suites to multi-site corporate estates, we offer tailored FM packages that flex with your headcount and occupancy — no long lock-ins required.',
  },
  {
    keywords: ['quote', 'price', 'cost', 'how much', 'rate', 'charge'],
    answer:
      "We don't publish standard rates because every contract is scoped to your site's exact requirements. Fill in your details below and one of our team will come back to you with a tailored proposal — usually within one business day.",
  },
  {
    keywords: ['contact', 'phone', 'call', 'email', 'speak', 'talk'],
    answer:
      "You can reach us via the Contact page, or leave your details here and we'll call you back. Our office hours are Monday–Friday 8am–6pm, but the reactive helpdesk runs 24/7.",
  },
  {
    keywords: ['contract', 'SLA', 'agreement', 'term', 'length', 'minimum'],
    answer:
      "Contract lengths vary by service — some clients prefer rolling monthly agreements, others benefit from the savings a 12-month or 3-year term provides. We'll recommend what makes sense for your situation.",
  },
  {
    keywords: ['staff', 'team', 'trained', 'qualified', 'certified', 'DBS'],
    answer:
      'All Atlas South operatives are vetted, DBS-checked where applicable, and trained to the relevant industry standards — from NICEIC-registered electricians to SIA-licensed security officers.',
  },
];

function matchFAQ(input: string): string | null {
  const lower = input.toLowerCase();
  for (const faq of FAQS) {
    if (faq.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return faq.answer;
    }
  }
  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'greeting' | 'faq-mode' | 'lead-name' | 'lead-email' | 'lead-services' | 'lead-message' | 'submitted';

interface Message {
  from: 'bot' | 'user';
  text: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('greeting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadServices, setLeadServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Attention pulse — fires on mount (after a short delay so the page has settled)
  // and then every 12 s while the widget is closed.
  useEffect(() => {
    if (open || prefersReducedMotion()) return;
    // Show the "Chat with us" label peek after 3 s
    const labelTimer = window.setTimeout(() => setLabelVisible(true), 3000);
    const labelHideTimer = window.setTimeout(() => setLabelVisible(false), 7000);
    // First pulse
    const firstPulse = window.setTimeout(() => setPulsing(true), 2800);
    const firstPulseOff = window.setTimeout(() => setPulsing(false), 4200);
    // Repeat pulse every 14 s
    const interval = window.setInterval(() => {
      setPulsing(true);
      window.setTimeout(() => setPulsing(false), 1400);
    }, 14000);

    return () => {
      clearTimeout(labelTimer);
      clearTimeout(labelHideTimer);
      clearTimeout(firstPulse);
      clearTimeout(firstPulseOff);
      clearInterval(interval);
    };
  }, [open]);

  const pushBot = useCallback((text: string) => {
    setMessages((prev) => [...prev, { from: 'bot', text }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { from: 'user', text }]);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Greeting on open
  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      window.setTimeout(() => {
        pushBot(
          'Hi there 👋 I\'m the Atlas South assistant. I can answer questions about our services, or help you get in touch with the team.',
        );
      }, 300);
    }
  }, [open, messages.length, pushBot]);

  function handleOpen() {
    setOpen(true);
    setLabelVisible(false);
  }

  function handleClose() {
    setOpen(false);
  }

  function reset() {
    setMessages([]);
    setStep('greeting');
    setInput('');
    setLeadName('');
    setLeadEmail('');
    setLeadServices([]);
  }

  // ── Quick action handlers ──────────────────────────────────────────────────

  function startQuote() {
    pushUser("I'd like to get a quote");
    window.setTimeout(() => {
      pushBot('Great! Let\'s get you connected with the team. What\'s your name?');
      setStep('lead-name');
    }, 400);
  }

  function startFAQ() {
    pushUser('I have a question');
    window.setTimeout(() => {
      pushBot(
        "Ask me anything — I know Atlas South's services, coverage areas, and how we work.",
      );
      setStep('faq-mode');
    }, 400);
  }

  // ── Submit handlers ────────────────────────────────────────────────────────

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (step === 'faq-mode') {
      pushUser(text);
      const answer = matchFAQ(text);
      if (answer) {
        window.setTimeout(() => {
          pushBot(answer);
          window.setTimeout(() => {
            pushBot('Can I help with anything else, or would you like to get a quote?');
          }, 800);
        }, 400);
      } else {
        window.setTimeout(() => {
          pushBot(
            'I don\'t have a specific answer for that, but our team will. Would you like to leave your details so we can get back to you?',
          );
          window.setTimeout(() => {
            pushBot('What\'s your name?');
            setStep('lead-name');
          }, 600);
        }, 400);
      }
      return;
    }

    if (step === 'lead-name') {
      pushUser(text);
      setLeadName(text);
      window.setTimeout(() => {
        pushBot(`Nice to meet you, ${text.split(' ')[0]}! What's your email address?`);
        setStep('lead-email');
      }, 400);
      return;
    }

    if (step === 'lead-email') {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(text)) {
        pushUser(text);
        window.setTimeout(() => pushBot('That doesn\'t look like a valid email — please try again.'), 400);
        return;
      }
      pushUser(text);
      setLeadEmail(text);
      window.setTimeout(() => {
        pushBot('Which service(s) are you interested in? Select all that apply, then hit Send.');
        setStep('lead-services');
      }, 400);
      return;
    }

    if (step === 'lead-message') {
      pushUser(text);
      submitLead(text);
      return;
    }
  }

  function handleServiceToggle(service: string) {
    setLeadServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    );
  }

  function confirmServices() {
    if (leadServices.length === 0) return;
    pushUser(leadServices.join(', '));
    window.setTimeout(() => {
      pushBot('Got it. Anything else you\'d like us to know before we reach out? (Or press Send to skip.)');
      setStep('lead-message');
    }, 400);
  }

  async function submitLead(message?: string) {
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          services: leadServices.join(', '),
          message: message || undefined,
        }),
      });
    } catch {
      // best-effort — still show success to the user
    } finally {
      setSubmitting(false);
      window.setTimeout(() => {
        pushBot(
          `Thanks, ${leadName.split(' ')[0]}! We've got your details and will be in touch at ${leadEmail} shortly. Is there anything else I can help with?`,
        );
        setStep('submitted');
      }, 400);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating trigger button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* "Chat with us" peek label */}
        <div
          className={`pointer-events-none select-none whitespace-nowrap rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-500 ${
            labelVisible && !open ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
          aria-hidden="true"
        >
          Chat with us ✨
        </div>

        {/* Pulse ring — sits behind the button */}
        {!open && (
          <span
            className={`pointer-events-none absolute inset-0 rounded-full bg-accent-blue/40 ${
              pulsing && !prefersReducedMotion()
                ? 'animate-ping'
                : ''
            }`}
            aria-hidden="true"
          />
        )}

        <button
          onClick={open ? handleClose : handleOpen}
          aria-label={open ? 'Close chat' : 'Open chat'}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-xl ring-2 ring-accent-blue/30 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-blue active:scale-95"
        >
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
              open ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
            }`}
          >
            <X className="h-6 w-6" />
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
              open ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
            }`}
          >
            <MessageCircle className="h-6 w-6" />
          </span>
        </button>
      </div>

      {/* ── Chat window ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-300 ease-out ${
          open
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
        style={{ height: '480px' }}
        role="dialog"
        aria-label="Atlas South chat assistant"
        aria-modal="false"
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-navy px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue/20">
            <MessageCircle className="h-5 w-5 text-accent-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white leading-tight">Atlas South</p>
            <p className="text-xs text-slate-400 leading-tight">Usually replies instantly</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-navy text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Greeting quick-actions */}
          {step === 'greeting' && messages.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={startQuote}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-navy hover:bg-slate-50 transition-colors"
              >
                Get a quote
                <ChevronRight className="h-4 w-4 text-accent-blue" />
              </button>
              <button
                onClick={startFAQ}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-navy hover:bg-slate-50 transition-colors"
              >
                Ask a question
                <ChevronRight className="h-4 w-4 text-accent-blue" />
              </button>
            </div>
          )}

          {/* Service selector */}
          {step === 'lead-services' && (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleServiceToggle(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      leadServices.includes(s)
                        ? 'border-accent-blue bg-accent-blue text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-accent-blue'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {leadServices.length > 0 && (
                <button
                  onClick={confirmServices}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
                >
                  Confirm selection
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Post-submit actions */}
          {step === 'submitted' && (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={startFAQ}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-navy hover:bg-slate-50 transition-colors"
              >
                Ask another question
                <ChevronRight className="h-4 w-4 text-accent-blue" />
              </button>
              <button
                onClick={reset}
                className="text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                Start over
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar — hidden during service-selection step (chip grid takes its place) */}
        {step !== 'lead-services' && step !== 'greeting' && step !== 'submitted' && (
          <div className="border-t border-slate-100 px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <input
                ref={inputRef}
                type={step === 'lead-email' ? 'email' : 'text'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  step === 'lead-name'
                    ? 'Your full name…'
                    : step === 'lead-email'
                    ? 'Your email address…'
                    : step === 'lead-message'
                    ? 'Any extra details… (optional)'
                    : 'Type a message…'
                }
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                disabled={submitting}
                aria-label="Chat input"
              />
              <button
                onClick={handleSend}
                disabled={submitting || !input.trim()}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-white disabled:opacity-40 transition-opacity hover:bg-navy/80"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {step === 'lead-message' && (
              <button
                onClick={() => submitLead()}
                disabled={submitting}
                className="mt-2 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip and submit →
              </button>
            )}
          </div>
        )}

        {/* FAQ / greeting input */}
        {(step === 'faq-mode') && (
          <div className="border-t border-slate-100 px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                aria-label="Chat input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-white disabled:opacity-40 transition-opacity hover:bg-navy/80"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
