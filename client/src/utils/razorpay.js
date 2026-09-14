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
    if (!keyId && !orderData.isSandboxDemo) {
      if (onError) onError('Razorpay Key ID is not configured.');
      return;
    }

    // If backend provided a sandbox demo order (e.g. while account is under review)
    if (orderData.isSandboxDemo) {
      const modalId = 'rzp-sandbox-modal';
      const existing = document.getElementById(modalId);
      if (existing) existing.remove();

      const modalContainer = document.createElement('div');
      modalContainer.id = modalId;
      modalContainer.className = 'fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200';
      modalContainer.innerHTML = `
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 relative text-center">
          <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black">
            💳
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            Razorpay Sandbox Simulator
          </span>
          <h3 class="text-xl font-black text-gray-900 mt-2.5">
            Pay ₹${(orderData.amount / 100).toFixed(2)}
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            Simulate online payment via Razorpay test mode.
          </p>
          <div class="mt-4 p-3 bg-stone-50 rounded-xl text-left border border-gray-100 text-xs space-y-1">
            <div class="flex justify-between text-gray-500">
              <span>Merchant:</span>
              <span class="font-bold text-gray-800">Sandwich Adda</span>
            </div>
            <div class="flex justify-between text-gray-500">
              <span>Order ID:</span>
              <span class="font-mono text-gray-700 text-[10px]">${orderData.order_id}</span>
            </div>
          </div>
          <div class="mt-5 flex gap-2">
            <button id="rzp-sim-cancel" type="button" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors">
              Cancel
            </button>
            <button id="rzp-sim-success" type="button" class="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5">
              <span>Simulate Pay ✓</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modalContainer);

      const cancelBtn = document.getElementById('rzp-sim-cancel');
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          modalContainer.remove();
          if (onDismiss) onDismiss();
        };
      }

      const successBtn = document.getElementById('rzp-sim-success');
      if (successBtn) {
        successBtn.onclick = async () => {
          successBtn.disabled = true;
          successBtn.innerText = 'Verifying...';

          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderData.order_id,
                razorpay_payment_id: `pay_sim_${Date.now()}`,
                razorpay_signature: 'sandbox_verified'
              })
            });

            const verifyData = await verifyRes.json();
            modalContainer.remove();

            if (onSuccess) {
              onSuccess({
                razorpay_order_id: orderData.order_id,
                razorpay_payment_id: `pay_sim_${Date.now()}`,
                razorpay_signature: 'sandbox_verified',
                verification: verifyData
              });
            }
          } catch (err) {
            modalContainer.remove();
            if (onError) onError('Payment verification error: ' + err.message);
          }
        };
      }
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
