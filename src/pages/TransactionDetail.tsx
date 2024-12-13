import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { journalService } from '../lib/services/journalService';
import { ArrowLeft, Clock, Tag, DollarSign, FileText, Image as ImageIcon, Pencil, Trash2, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateTransactionStatus } from '../utils/transactions';
import { OrdersList } from '../components/transactions/OrdersList';
import type { Transaction } from '../types/transaction';
import { TransactionModal } from '../components/modals/TransactionModal';
import { LoadingScreen } from '../components/ui/LoadingScreen';

export function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id || !user) return;

      try {
        const { data, error } = await journalService.getTransaction(id);
        if (error) throw error;
        if (!data) throw new Error('Transaction not found');
        
        setTransaction(data);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transaction');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchTransaction();
  }, [id, user]);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link
            to="/journal"
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!transaction || isDeleting) return;
    
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    setIsDeleting(true);
    try {
      // In a real app, we would delete from a backend here
      navigate('/journal');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (orders: Transaction[]) => {
    if (!transaction) return;
    
    try {
      setTransaction(orders[0]);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Failed to update transaction');
    }
  };

  if (!transaction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Transaction not found</h2>
          <p className="mt-2 text-gray-600">The transaction you're looking for doesn't exist.</p>
          <Link
            to="/journal"
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/journal')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {transaction.symbol} - {transaction.type.toUpperCase()}
              </h1>
              <div className="mt-1 flex items-center space-x-3">
                <p className="text-sm text-gray-500">
                  Transaction ID: {transaction.id}
                </p>
                {transaction.status === 'open' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Open ({transaction.remainingQuantity} remaining)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Closed
                  </span>
                )}
              </div>
              <div className="mt-2 flex space-x-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-2 text-indigo-600 hover:text-indigo-700 rounded-md"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-red-500 hover:text-red-700 rounded-md disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              transaction.side === 'Long'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            } inline-flex items-center space-x-2`}>
              {transaction.side === 'Long' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{transaction.side}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
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

              {transaction.type === 'option' && transaction.optionDetails && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Option Details</h3>
                  <dl className="mt-3 space-y-3">
                    <div className="flex items-center text-sm">
                      <dt className="font-medium text-gray-500 w-24">Type:</dt>
                      <dd className="capitalize">{transaction.optionDetails.optionType}</dd>
                    </div>
                    <div className="flex items-center text-sm">
                      <dt className="font-medium text-gray-500 w-24">Strike:</dt>
                      <dd>{formatCurrency(transaction.optionDetails.strike)}</dd>
                    </div>
                    <div className="flex items-center text-sm">
                      <dt className="font-medium text-gray-500 w-24">Expiration:</dt>
                      <dd>{formatDate(transaction.optionDetails.expiration)}</dd>
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
            {transaction.chartImage && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-3">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Chart
                </h3>
                <img
                  src={transaction.chartImage}
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
      </div>
      
      {showEditModal && transaction && (
        <TransactionModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          initialData={[transaction]}
        />
      )}
    </main>
  );
}
