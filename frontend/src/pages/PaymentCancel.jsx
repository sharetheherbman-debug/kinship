import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-primary mb-4">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. No charges were made. You can try again anytime from the settings page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/settings">
            <Button className="btn-primary" data-testid="try-again-btn">
              Try Again
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" data-testid="back-to-dashboard-btn">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
