import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ChevronRight, MessageSquarePlus, CircleHelp } from 'lucide-react';
import { prefersReducedMotion } from '@atlas-south/design-system';
import { useSectionTheme } from '../../hooks/useSectionTheme.js';
import { ChatBadgeIcon } from './ChatBadgeIcon.js';

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
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Which page section is behind the launcher right now — drives the badge's colour
  // inversion so it never gets drowned out by whatever it's floating over.
  const sectionTheme = useSectionTheme();

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

  // Shows the typing indicator, waits a beat, then delivers the message — makes replies
  // feel like they're actually being composed rather than teleporting in instantly.
  // Skips the wait under prefers-reduced-motion (indicator would just be a flash anyway).
  const botSay = useCallback(
    (text: string) => {
      const delay = prefersReducedMotion() ? 0 : 850;
      setIsTyping(true);
      return new Promise<void>((resolve) => {
        window.setTimeout(() => {
          setIsTyping(false);
          pushBot(text);
          resolve();
        }, delay);
      });
    },
    [pushBot],
  );

  // Scroll to bottom whenever messages change, or the typing indicator appears/disappears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
        botSay(
          "Hi there — I'm the Atlas South assistant. I can answer questions about our services, or help you get in touch with the team.",
        );
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, messages.length]);

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

  async function startQuote() {
    pushUser("I'd like to get a quote");
    await botSay("Great! Let's get you connected with the team. What's your name?");
    setStep('lead-name');
  }

  async function startFAQ() {
    pushUser('I have a question');
    await botSay("Ask me anything — I know Atlas South's services, coverage areas, and how we work.");
    setStep('faq-mode');
  }

  // ── Submit handlers ────────────────────────────────────────────────────────

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (step === 'faq-mode') {
      pushUser(text);
      const answer = matchFAQ(text);
      if (answer) {
        await botSay(answer);
        await botSay('Can I help with anything else, or would you like to get a quote?');
      } else {
        await botSay(
          "I don't have a specific answer for that, but our team will. Would you like to leave your details so we can get back to you?",
        );
        await botSay("What's your name?");
        setStep('lead-name');
      }
      return;
    }

    if (step === 'lead-name') {
      pushUser(text);
      setLeadName(text);
      await botSay(`Nice to meet you, ${text.split(' ')[0]}! What's your email address?`);
      setStep('lead-email');
      return;
    }

    if (step === 'lead-email') {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(text)) {
        pushUser(text);
        await botSay("That doesn't look like a valid email — please try again.");
        return;
      }
      pushUser(text);
      setLeadEmail(text);
      await botSay('Which service(s) are you interested in? Select all that apply, then hit Send.');
      setStep('lead-services');
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

  async function confirmServices() {
    if (leadServices.length === 0) return;
    pushUser(leadServices.join(', '));
    await botSay("Got it. Anything else you'd like us to know before we reach out? (Or press Send to skip.)");
    setStep('lead-message');
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
      await botSay(
        `Thanks, ${leadName.split(' ')[0]}! We've got your details and will be in touch at ${leadEmail} shortly. Is there anything else I can help with?`,
      );
      setStep('submitted');
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
        {/* "Chat with us" peek label — same colour inversion as the badge, so the two
            always read as one piece regardless of what's behind them. */}
        <div
          className={`pointer-events-none select-none whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold shadow-lg transition-all duration-500 ${
            labelVisible && !open ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          } ${
            sectionTheme === 'dark' ? 'bg-white text-navy' : 'bg-navy text-white'
          }`}
          aria-hidden="true"
        >
          Chat with us
        </div>

        <button
          onClick={open ? handleClose : handleOpen}
          aria-label={open ? 'Close chat' : 'Open chat'}
          className="relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-blue active:scale-95"
        >
          {/* Pulse ring — sits behind the badge, colour-matched to it */}
          {!open && (
            <span
              className={`pointer-events-none absolute inset-0 rounded-full ${
                sectionTheme === 'dark' ? 'bg-white/40' : 'bg-accent-blue/40'
              } ${pulsing && !prefersReducedMotion() ? 'animate-ping' : ''}`}
              aria-hidden="true"
            />
          )}

          <span
            className={`absolute inset-0 flex items-center justify-center rounded-full shadow-xl transition-all duration-200 ${
              sectionTheme === 'dark' ? 'bg-white' : 'bg-navy'
            } ${open ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
          >
            <X className={`h-6 w-6 ${sectionTheme === 'dark' ? 'text-navy' : 'text-white'}`} />
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
              open ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
            }`}
          >
            <ChatBadgeIcon theme={sectionTheme} size={56} showStatusDot />
          </span>
        </button>
      </div>

      {/* ── Chat window ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-[20px] border border-border bg-canvas shadow-[0_24px_60px_-16px_rgba(0,36,132,0.35),0_4px_14px_rgba(0,36,132,0.12)] transition-all duration-300 ease-out ${
          open
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
        style={{ height: 'min(600px, 75vh)' }}
        role="dialog"
        aria-label="Atlas South chat assistant"
        aria-modal="false"
      >
        {/* Header — badge is always drawn against this navy bar, so theme is fixed to
            'dark' (behind = dark) regardless of what section the page is scrolled to.
            border-b in accent-blue at low opacity gives the header a defined edge in the
            brand's own colour rather than a plain flat cut. */}
        <div className="flex items-center gap-3 border-b border-accent-blue/40 bg-navy px-4 py-3.5">
          <ChatBadgeIcon theme="dark" size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold leading-tight text-white">Atlas South</p>
            <p className="flex items-center gap-1.5 text-xs leading-tight text-white/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-75" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Online now
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages — canvas-tint background so the white message bubbles read as
            floating cards rather than sitting flush with the panel's own surface. */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-canvas-tint px-4 py-4 scroll-smooth">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex motion-safe:animate-message-in ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'rounded-tr-sm bg-navy text-white'
                    : 'rounded-tl-sm border border-border bg-canvas text-ink shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator — shown while botSay's delay is running, so replies read
              as composed in real time rather than teleporting in. */}
          {isTyping && (
            <div className="flex justify-start motion-safe:animate-message-in">
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-canvas px-4 py-3 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue" />
              </div>
            </div>
          )}

          {/* Greeting quick-actions */}
          {step === 'greeting' && messages.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 motion-safe:animate-message-in">
              <button
                onClick={startQuote}
                className="group flex items-center gap-3 rounded-xl border border-border bg-canvas px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                  <MessageSquarePlus className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-navy">Get a quote</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-accent-blue transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={startFAQ}
                className="group flex items-center gap-3 rounded-xl border border-border bg-canvas px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                  <CircleHelp className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-navy">Ask a question</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-accent-blue transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}

          {/* Service selector */}
          {step === 'lead-services' && (
            <div className="space-y-2 pt-1 motion-safe:animate-message-in">
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleServiceToggle(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      leadServices.includes(s)
                        ? 'border-accent-blue bg-accent-blue text-white'
                        : 'border-border bg-canvas text-ink hover:border-accent-blue'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {leadServices.length > 0 && (
                <button
                  onClick={confirmServices}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
                >
                  Confirm selection
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Post-submit actions */}
          {step === 'submitted' && (
            <div className="flex flex-col gap-2 pt-1 motion-safe:animate-message-in">
              <button
                onClick={startFAQ}
                className="group flex items-center gap-3 rounded-xl border border-border bg-canvas px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                  <CircleHelp className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-navy">Ask another question</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-accent-blue transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={reset}
                className="py-1 text-center text-xs text-slate/70 transition-colors hover:text-ink"
              >
                Start over
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar — hidden during service-selection (chip grid takes its place) and
            faq-mode (its own input bar below has a different placeholder/validation).
            Bordered field + accent-blue focus ring matches QuoteForm.tsx's convention
            rather than a flat filled pill, so it reads as a real form field. */}
        {step !== 'lead-services' && step !== 'greeting' && step !== 'submitted' && step !== 'faq-mode' && (
          <div className="border-t border-border bg-canvas px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-2 transition-colors focus-within:border-accent-blue focus-within:ring-2 focus-within:ring-accent-blue/25">
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
                className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-slate/60 outline-none"
                disabled={submitting}
                aria-label="Chat input"
              />
              <button
                onClick={handleSend}
                disabled={submitting || !input.trim()}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-white transition-opacity hover:bg-navy/80 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {step === 'lead-message' && (
              <button
                onClick={() => submitLead()}
                disabled={submitting}
                className="mt-2 w-full text-center text-xs text-slate/70 transition-colors hover:text-ink"
              >
                Skip and submit →
              </button>
            )}
          </div>
        )}

        {/* FAQ / greeting input */}
        {(step === 'faq-mode') && (
          <div className="border-t border-border bg-canvas px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-2 transition-colors focus-within:border-accent-blue focus-within:ring-2 focus-within:ring-accent-blue/25">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-slate/60 outline-none"
                aria-label="Chat input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-white transition-opacity hover:bg-navy/80 disabled:opacity-40"
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
