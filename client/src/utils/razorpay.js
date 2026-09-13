export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Standard Web Checkout
 * @param {Object} params
 * @param {number} params.amountInPaise - Order amount in paise (min 100)
 * @param {string} [params.currency='INR']
 * @param {string} [params.receipt]
 * @param {Object} [params.prefill] - { name, contact, email }
 * @param {Object} [params.notes]
 * @param {Function} params.onSuccess - Callback({ razorpay_order_id, razorpay_payment_id, razorpay_signature, verification })
 * @param {Function} params.onError - Callback(errorMessage)
 * @param {Function} [params.onDismiss] - Callback when modal is closed without payment
 */
export async function openRazorpayCheckout({
  amountInPaise,
  currency = 'INR',
  receipt,
  prefill = {},
  notes = {},
  onSuccess,
  onError,
  onDismiss
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    if (onError) onError('Could not load Razorpay payment SDK. Please check your internet connection.');
    return;
  }

  try {
    // STEP 1: BACKEND - Create Order
    const createRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        notes
      })
    });

    const orderData = await createRes.json();

    if (!createRes.ok || !orderData.order_id) {
      const msg = orderData.error || 'Failed to create payment order on server.';
      if (onError) onError(msg);
      return;
    }

    // Key ID priority: Vite env var -> backend returned key_id
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.key_id;
    if (!keyId) {
      if (onError) onError('Razorpay Key ID is not configured.');
      return;
    }

    // STEP 2: FRONTEND - Open Razorpay Modal
    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Sandwich Adda',
      description: 'Cheesy & Crispy Grilled Sandwiches Order',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=120&auto=format&fit=crop&q=80',
      order_id: orderData.order_id,
      prefill: {
        name: prefill.name || '',
        contact: prefill.contact || prefill.phone || '',
        email: prefill.email || ''
      },
      theme: {
        color: '#ea580c' // Orange theme
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        }
      },
      handler: async function (response) {
        // STEP 3: BACKEND - Verify Signature
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.verified) {
            if (onError) onError(verifyData.error || 'Payment signature verification failed. Please contact support.');
            return;
          }

          if (onSuccess) {
            onSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              verification: verifyData
            });
          }
        } catch (err) {
          if (onError) onError('Payment verification failed: ' + (err.message || 'Network error'));
        }
      }
    };

    const rzp = new window.Razorpay(options);

    // Handle payment.failed event
    rzp.on('payment.failed', function (failedResponse) {
      const desc = failedResponse?.error?.description || failedResponse?.error?.reason || 'Transaction could not be completed';
      if (onError) onError(`Payment failed: ${desc}`);
    });

    rzp.open();
  } catch (err) {
    if (onError) onError(err.message || 'Unexpected error launching Razorpay checkout');
  }
}
