import React from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Order } from '../../types/transaction';

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Orders</h3>
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-500">Date:</span>
                  <span className="ml-2">{formatDate(order.date)}</span>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-500">Time:</span>
                  <span className="ml-2">{order.time}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-500">Type:</span>
                  <span className={clsx(
                    'ml-2 px-2 py-0.5 rounded-full text-xs font-medium',
                    order.action === 'buy'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  )}>
                    {order.action === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-500">Quantity:</span>
                  <span className="ml-2">{order.quantity}</span>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-500">Price:</span>
                  <span className="ml-2">{formatCurrency(order.price)}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-500">Total:</span>
                  <span className="ml-2">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                <span className="font-medium text-gray-500">Notes:</span>
                <p className="mt-1">{order.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}