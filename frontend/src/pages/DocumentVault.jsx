import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, FileText, Plus, AlertTriangle, Calendar,
  CreditCard, Shield, Loader2, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DOC_TYPES = [
  { value: 'passport', label: 'Passport', icon: FileText },
  { value: 'visa', label: 'Visa', icon: FileText },
  { value: 'id', label: 'ID Card', icon: CreditCard },
  { value: 'insurance', label: 'Travel Insurance', icon: Shield },
];

export default function DocumentVault() {
  const { user, family } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [docType, setDocType] = useState('passport');
  const [docNumber, setDocNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [memberId, setMemberId] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (family) {
      fetchDocuments();
    }
  }, [family]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    try {
      const [docsRes, expiringRes] = await Promise.all([
        axios.get(`${API_URL}/api/documents/${family.id}`),
        axios.get(`${API_URL}/api/documents/${family.id}/expiring`)
      ]);
      
      setDocuments(docsRes.data);
      setExpiringDocs(expiringRes.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docNumber || !expiryDate || !memberId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/documents`, {
        family_id: family.id,
        member_id: memberId,
        doc_type: docType,
        doc_number: docNumber,
        expiry_date: expiryDate,
        country: country
      });

      toast.success('Document added successfully');
      setDialogOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to add document');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDocType('passport');
    setDocNumber('');
    setExpiryDate('');
    setMemberId('');
    setCountry('');
  };

  const getDocIcon = (type) => {
    const docType = DOC_TYPES.find(d => d.value === type);
    return docType?.icon || FileText;
  };

  const getMemberName = (memberId) => {
    const member = family?.member_details?.find(m => m.id === memberId);
    return member?.name || 'Unknown';
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-heading font-bold text-primary">Document Vault</h1>
                  <p className="text-xs text-muted-foreground">Secure travel document storage</p>
                </div>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="add-document-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Travel Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddDocument} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_TYPES.map(doc => (
                          <SelectItem key={doc.value} value={doc.value}>
                            {doc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Family Member *</Label>
                    <Select value={memberId} onValueChange={setMemberId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {family?.member_details?.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Document Number *</Label>
                    <Input
                      placeholder="Last 4 digits only for security"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="input-base"
                      maxLength={20}
                      data-testid="doc-number-input"
                    />
                    <p className="text-xs text-muted-foreground">Only last 4 characters will be stored</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="input-base"
                      data-testid="expiry-date-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Issuing Country</Label>
                    <Input
                      placeholder="e.g., South Africa"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input-base"
                      data-testid="country-input"
                    />
                  </div>

                  <Button type="submit" className="w-full btn-primary" disabled={saving} data-testid="save-document-btn">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Document'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Expiring Soon Alert */}
        {expiringDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-destructive mb-2">Documents Expiring Soon</h3>
                <div className="space-y-2">
                  {expiringDocs.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>
                        <strong>{getMemberName(doc.member_id)}</strong>'s {doc.doc_type}
                      </span>
                      <span className={`font-medium ${doc.days_until_expiry < 30 ? 'text-destructive' : 'text-secondary'}`}>
                        {doc.days_until_expiry < 0 ? 'Expired' : `${doc.days_until_expiry} days left`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* All Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-heading font-bold text-xl text-primary mb-4">All Documents</h2>

          {documents.length === 0 ? (
            <div className="card-base p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg text-primary mb-2">No Documents Yet</h3>
              <p className="text-muted-foreground mb-6">
                Store your family's travel documents securely and get expiry reminders.
              </p>
              <Button className="btn-primary" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc, index) => {
                const Icon = getDocIcon(doc.doc_type);
                const daysLeft = getDaysUntilExpiry(doc.expiry_date);
                const isExpiring = daysLeft < 90;
                const isExpired = daysLeft < 0;

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`card-base p-5 ${isExpired ? 'border-destructive/30' : isExpiring ? 'border-secondary/30' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isExpired ? 'bg-destructive/20' : isExpiring ? 'bg-secondary/20' : 'bg-accent/20'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isExpired ? 'text-destructive' : isExpiring ? 'text-secondary' : 'text-accent'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-bold text-primary capitalize">{doc.doc_type}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isExpired ? 'bg-destructive/20 text-destructive' : 
                            isExpiring ? 'bg-secondary/20 text-secondary' : 
                            'bg-accent/20 text-accent'
                          }`}>
                            {isExpired ? 'Expired' : isExpiring ? `${daysLeft} days` : 'Valid'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{getMemberName(doc.member_id)}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            ****{doc.doc_number}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(doc.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                        {doc.country && (
                          <p className="text-xs text-muted-foreground mt-1">{doc.country}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-base p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-primary mb-2">Your Data is Secure</h3>
              <p className="text-sm text-muted-foreground">
                Only the last 4 characters of document numbers are stored for verification purposes. 
                All data is encrypted and only accessible by your family members. We never share 
                your information with third parties.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
