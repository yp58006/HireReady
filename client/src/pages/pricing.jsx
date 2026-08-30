import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { serverurl } from '../App.jsx';
import { setUserdata } from '../redux/slices/userSlice.js';
import './pricing.css';

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    originalPrice: 79,
    amount: 49,
    credits: 500,
    description: 'Perfect for quick interview practice and lightweight prep.',
    isFeatured: false,
    discount: 'Save 38%',
    accent: 'starter',
    features: [
      '500 interview credits',
      'Access to core mock interview modes',
      'Resume-based question practice',
      'Basic score insights and summaries',
    ],
    button: 'Choose Starter',
    buttonClass: 'starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    originalPrice: 149,
    amount: 99,
    credits: 1100,
    description: 'Best for serious job seekers who want regular interview practice.',
    isFeatured: true,
    discount: 'Save 34%',
    accent: 'pro',
    features: [
      '1100 interview credits',
      'Unlimited mock rounds for 30 days',
      'AI feedback on strengths and gaps',
      'Priority access to premium interview tracks',
    ],
    button: 'Choose Pro',
    buttonClass: 'pro',
  },
  {
    key: 'premium',
    name: 'Premium',
    originalPrice: 249,
    amount: 199,
    credits: 2500,
    description: 'Built for high-intent candidates preparing for multiple roles.',
    isFeatured: false,
    discount: 'Save 20%',
    accent: 'premium',
    features: [
      '2500 interview credits',
      'Advanced role-specific interview bots',
      'Deep performance analytics and trends',
      'Dedicated prep support for final rounds',
    ],
    button: 'Choose Premium',
    buttonClass: 'premium',
  },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Pricing() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handlePayment = async (plan) => {
    if (!userData) {
      setMessage('Please log in first to purchase a plan.');
      return;
    }

    try {
      setProcessing(true);
      setMessage('');

      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady) {
        throw new Error('Razorpay SDK failed to load.');
      }

      const { data: orderData } = await axios.post(
        `${serverurl}/api/payment/create-order`,
        { planId: plan.key },
        { withCredentials: true }
      );

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HireReady',
        description: `${plan.name} Plan`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              `${serverurl}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true }
            );

            dispatch(
              setUserdata({
                ...userData,
                credits: verifyResponse.data.credits,
              })
            );

            setMessage(`Payment successful! ${verifyResponse.data.credits} credits added.`);
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Payment verification failed.';
            setMessage(errorMessage);
          }
        },
        prefill: {
          name: userData?.name || '',
          email: userData?.email || '',
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          ondismiss: () => {
            setMessage('Payment cancelled.');
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Unable to start payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-shell">
        <header className="pricing-header">
          <span className="pricing-kicker">Flexible plans</span>
          <h1>Choose a plan that fits your preparation.</h1>
          <p>
            Practice with more intention, build confidence through feedback, and keep moving
            toward the role you want.
          </p>
        </header>

        {message && (
          <div className="pricing-message" role="alert">
            {message}
          </div>
        )}

        <section className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-card ${plan.accent} ${plan.isFeatured ? 'featured' : ''}`}
            >
              {plan.isFeatured && <span className="plan-badge">Most Popular</span>}

              <div className="plan-header-row">
                <div className="plan-top">
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <span className="plan-discount">{plan.discount}</span>
              </div>

              <div className="plan-price-wrap">
                <div className="plan-original-price">₹{plan.originalPrice}</div>
                <div className="plan-price">
                  <strong>₹{plan.amount}</strong>
                  <span>/ month</span>
                </div>
              </div>

              <div className="plan-credits">{plan.credits} credits included</div>

              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <button
                type="button"
                className={`plan-action ${plan.buttonClass}`}
                onClick={() => handlePayment(plan)}
                disabled={processing}
              >
                {processing ? 'Processing...' : plan.button}
              </button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Pricing;
