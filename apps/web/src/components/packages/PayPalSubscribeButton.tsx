import { useEffect, useRef, useState } from 'react';
import { Icon } from '@atlas-south/design-system';
import { loadPayPalSdk } from '../../lib/paypalSdk.js';
import { trackCTAClick } from '../../lib/analytics.js';

interface PayPalSubscribeButtonProps {
  /** PayPal billing plan id for this tier — see PricingTier.paypalPlanId (types/content.ts). */
  planId: string;
  tierLabel: string;
}

type Status = 'idle' | 'confirming' | 'success' | 'error';

/**
 * Renders PayPal's own Smart Button for a recurring subscription — see
 * docs/build/14-PAYPAL-INTEGRATION.md. The button itself, and the approval popup it
 * opens, are entirely PayPal's UI running in PayPal's own origin; this component never
 * sees or handles card details or PayPal login credentials, which is what keeps this
 * integration in PCI DSS SAQ A scope rather than SAQ D.
 *
 * `createSubscription` only ever references `planId` — a fixed prop from our own seeded
 * content, never anything user-editable — so there's no way for a page visitor to get
 * PayPal to create a subscription against a plan (hence price) this app didn't choose.
 *
 * After the buyer approves in PayPal's popup, `onApprove` posts the resulting
 * subscription id to our own API (POST /api/paypal/subscriptions), which re-verifies it
 * server-side against PayPal itself before recording anything — this component's job
 * ends at reporting the id, not at deciding whether the subscription is real.
 */
export function PayPalSubscribeButton({ planId, tierLabel }: PayPalSubscribeButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
    if (!clientId || !containerRef.current) return;

    let cancelled = false;

    loadPayPalSdk(clientId)
      .then((paypal) => {
        if (cancelled || !containerRef.current) return;
        return paypal
          .Buttons({
            style: { shape: 'rect', color: 'blue', label: 'subscribe', height: 44 },
            createSubscription: (_data, actions) => actions.subscription.create({ plan_id: planId }),
            onApprove: (data) => {
              if (!data.subscriptionID) return;
              setStatus('confirming');
              fetch('/api/paypal/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paypalSubscriptionId: data.subscriptionID }),
              })
                .then((res) => {
                  if (!res.ok) throw new Error(`Confirm failed: ${res.status}`);
                  setStatus('success');
                  trackCTAClick(`paypal-subscribed-${tierLabel}`);
                })
                .catch((err) => {
                  console.error('Failed to confirm PayPal subscription:', err);
                  setStatus('error');
                });
            },
            onError: (err) => {
              console.error('PayPal Buttons error:', err);
              setStatus('error');
            },
          })
          .render(containerRef.current);
      })
      .catch((err) => {
        console.error('Failed to load PayPal SDK:', err);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [planId, tierLabel]);

  if (status === 'success') {
    return (
      <p className="mt-6 flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-accent-blue/10 px-4 text-sm font-semibold text-accent-blue">
        <Icon name="badge-check" size={16} />
        You&apos;re subscribed — a confirmation is on its way.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <div ref={containerRef} />
      {status === 'confirming' && <p className="mt-2 text-center text-xs text-slate">Confirming your subscription…</p>}
      {status === 'error' && (
        <p className="mt-2 text-center text-xs text-red-600">
          Something went wrong. Please try again, or{' '}
          <a href="/company/contact" className="underline">
            contact us
          </a>{' '}
          to subscribe.
        </p>
      )}
    </div>
  );
}
