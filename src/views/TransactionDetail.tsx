import { useState, useEffect } from '@/lib/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, DollarSign, FileText, Image as ImageIcon, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { OrdersList } from '@/components/transactions/OrdersList';
import type { Transaction } from '@/types/database';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTransaction(data);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, supabase]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      navigate('/app/journal');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
    }
  };

  const handleDeleteImage = async () => {
    if (!id || !transaction) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ chart_image: null })
        .eq('id', id);

      if (error) throw error;
      setTransaction(prev => prev ? { ...prev, chart_image: undefined } : null);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="p-6">
        <p className="mt-2 text-gray-600">{error}</p>
        <Link
          to="/app/journal"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </Link>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6">
        <p className="mt-2 text-gray-600">The transaction you're looking for doesn't exist.</p>
        <Link
          to="/app/journal"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/app/journal')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              {transaction.symbol}
              <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                transaction.side === 'Long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {transaction.side}
              </span>
              {transaction.status === 'open' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Open ({transaction.remaining_quantity} remaining)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Closed
                </span>
              )}
            </h2>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center text-red-600 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              <dl className="mt-3 space-y-3">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <dt className="font-medium text-gray-500 w-24">Date:</dt>
                  <dd>{formatDate(transaction.date)}</dd>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <dt className="font-medium text-gray-500 w-24">Time:</dt>
                  <dd>{transaction.time}</dd>
                </div>
                <div className="flex items-center text-sm">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <dt className="font-medium text-gray-500 w-24">Quantity:</dt>
                  <dd>{transaction.quantity}</dd>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <dt className="font-medium text-gray-500 w-24">Price:</dt>
                  <dd>{formatCurrency(transaction.price)}</dd>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <dt className="font-medium text-gray-500 w-24">Total:</dt>
                  <dd>{formatCurrency(transaction.total)}</dd>
                </div>
              </dl>
            </div>

            {transaction.type === 'option' && transaction.option_details && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Option Details</h3>
                <dl className="mt-3 space-y-3">
                  <div className="flex items-center text-sm">
                    <dt className="font-medium text-gray-500 w-24">Type:</dt>
                    <dd className="capitalize">{transaction.option_details.type}</dd>
                  </div>
                  <div className="flex items-center text-sm">
                    <dt className="font-medium text-gray-500 w-24">Strike:</dt>
                    <dd>{formatCurrency(transaction.option_details.strike)}</dd>
                  </div>
                  <div className="flex items-center text-sm">
                    <dt className="font-medium text-gray-500 w-24">Expiration:</dt>
                    <dd>{formatDate(transaction.option_details.expiration)}</dd>
                  </div>
                </dl>
              </div>
            )}

            {transaction.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </h3>
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {transaction.notes}
                </p>
              </div>
            )}
          </div>

          {/* Chart Image */}
          {transaction.chart_image && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-3">
                <ImageIcon className="h-4 w-4 mr-2" />
                Chart
                <button
                  onClick={handleDeleteImage}
                  className="ml-2 text-sm text-red-600 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </h3>
              <img
                src={transaction.chart_image}
                alt="Trade chart"
                className="rounded-lg shadow-lg max-w-full"
              />
            </div>
          )}
        </div>
        
        {transaction.orders && transaction.orders.length > 0 && (
          <div className="mt-8">
            <OrdersList orders={transaction.orders} />
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
