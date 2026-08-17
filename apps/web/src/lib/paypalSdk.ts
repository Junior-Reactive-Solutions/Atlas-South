/**
 * Loads PayPal's JS SDK (https://www.paypal.com/sdk/js) exactly the way PayPal's own docs
 * recommend it — a single external <script> tag, not an npm package — and caches the
 * loaded `window.paypal` so multiple <PayPalSubscribeButton> instances on the same page
 * (one per pricing tier) never insert the script twice. See
 * docs/build/15-PAYPAL-INTEGRATION.md.
 */

/** The subset of the SDK's Buttons API this app actually uses. */
export interface PayPalNamespace {
  Buttons(options: {
    style?: { shape?: 'pill' | 'rect'; color?: 'gold' | 'blue' | 'silver' | 'white' | 'black'; label?: 'subscribe' | 'paypal'; height?: number };
    createSubscription: (data: unknown, actions: { subscription: { create: (opts: { plan_id: string }) => Promise<string> } }) => Promise<string>;
    onApprove: (data: { subscriptionID?: string }) => void;
    onError?: (err: unknown) => void;
    onCancel?: () => void;
  }): { render: (container: HTMLElement) => Promise<void> };
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

let sdkPromise: Promise<PayPalNamespace> | null = null;

/**
 * `intent=subscription&vault=true` are required query params for the Buttons component to
 * offer `actions.subscription.create` at all — omitting them renders a one-time-payment
 * button instead, per PayPal's SDK docs.
 */
export function loadPayPalSdk(clientId: string): Promise<PayPalNamespace> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription&currency=GBP`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) resolve(window.paypal);
      else reject(new Error('PayPal SDK script loaded but window.paypal was not set.'));
    };
    script.onerror = () => reject(new Error('Failed to load the PayPal SDK script.'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}
