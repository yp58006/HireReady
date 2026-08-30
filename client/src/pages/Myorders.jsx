import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { serverurl } from '../App.jsx'

const formatPlanName = (planId) => {
  if (!planId) return 'Custom plan'

  return String(planId)
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

const formatDate = (value) => {
  if (!value) return 'N/A'

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Myorders() {
  const userData = useSelector((state) => state.user.userData)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPayments = async () => {
      if (!userData) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await axios.get(`${serverurl}/api/payment/history`, { withCredentials: true })
        setPayments(response.data?.payments || [])
      } catch (err) {
        console.error('Failed to fetch payment history:', err)
        setError(err.response?.data?.message || 'Unable to load your payment history.')
        setPayments([])
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [userData])

  return (
    <main style={{ minHeight: '100vh', background: '#f4f8fc', padding: '32px 20px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ margin: 0, color: '#2563eb', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
            Billing
          </p>
          <h1 style={{ margin: '10px 0 0', fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-0.06em', color: '#14253d' }}>
            My Orders
          </h1>
        </div>

        {!userData ? (
          <div style={{ background: '#fff', border: '1px solid #dfeaf5', borderRadius: '18px', padding: '28px', boxShadow: '0 16px 30px rgba(15, 23, 42, 0.04)' }}>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#495d7a' }}>Please sign in to view your payment history.</p>
          </div>
        ) : loading ? (
          <div style={{ background: '#fff', border: '1px solid #dfeaf5', borderRadius: '18px', padding: '28px', textAlign: 'center', color: '#495d7a' }}>
            Loading your orders...
          </div>
        ) : error ? (
          <div style={{ background: '#fff', border: '1px solid #ffd9d9', borderRadius: '18px', padding: '20px 24px', color: '#b42318' }}>
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dfeaf5', borderRadius: '18px', padding: '28px', boxShadow: '0 16px 30px rgba(15, 23, 42, 0.04)' }}>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#495d7a' }}>No payments found yet. Your purchase history will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {payments.map((payment) => (
              <article
                key={payment._id || payment.orderId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 1fr 1fr 1.1fr 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  background: '#fff',
                  border: '1px solid #dfeaf5',
                  borderRadius: '20px',
                  padding: '20px 22px',
                  boxShadow: '0 16px 30px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#5f7189', marginBottom: '8px' }}>
                    Plan
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#14253d' }}>
                    {formatPlanName(payment.planId)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#5f7189', marginBottom: '8px' }}>
                    Amount
                  </div>
                  <div style={{ fontWeight: 700, color: '#14253d' }}>₹{payment.amount}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#5f7189', marginBottom: '8px' }}>
                    Credits
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f9f7d' }}>{payment.credits} credits</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#5f7189', marginBottom: '8px' }}>
                    Date
                  </div>
                  <div style={{ color: '#495d7a' }}>{formatDate(payment.createdAt)}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '90px',
                      padding: '8px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: payment.status === 'paid' ? 'rgba(15, 159, 125, 0.1)' : payment.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: payment.status === 'paid' ? '#0f9f7d' : payment.status === 'failed' ? '#b42318' : '#b45309',
                    }}
                  >
                    {payment.status || 'Pending'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Myorders
