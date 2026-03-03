import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/payments/status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        setPaymentDetails(response.data);
        return;
      } else if (response.data.status === 'expired') {
        setStatus('expired');
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Payment status check failed:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="font-heading text-2xl font-bold text-primary mb-4">
              Processing Payment...
            </h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-primary mb-4">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for upgrading to Premium! Your account has been updated.
            </p>
            {paymentDetails && (
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">Amount paid</p>
                <p className="font-heading font-bold text-2xl">
                  ${paymentDetails.amount} {paymentDetails.currency?.toUpperCase()}
                </p>
              </div>
            )}
            <Link to="/dashboard">
              <Button className="btn-primary" data-testid="back-to-dashboard-btn">
                Back to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}

        {(status === 'error' || status === 'timeout' || status === 'expired') && (
          <>
            <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">!</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-primary mb-4">
              Payment Status Unknown
            </h1>
            <p className="text-muted-foreground mb-6">
              We couldn't verify your payment status. Please check your email for confirmation or contact support.
            </p>
            <Link to="/dashboard">
              <Button className="btn-primary">
                Back to Dashboard
              </Button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
