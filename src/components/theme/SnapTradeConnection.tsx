import { snapTradeService } from '@/services/snaptradeService';
import { useState } from 'react';

export function SnapTradeConnection() {
  const [userId, setUserId] = useState('');

  const handleCheckStatus = async () => {
    try {
      const status = await snapTradeService.checkApiStatus();
      console.log('SnapTrade API Status:', status);
      // You could also show this in a toast or alert
      alert(`SnapTrade API Status:\nVersion: ${status.version}\nOnline: ${status.online}\nTimestamp: ${status.timestamp}`);
    } catch (error) {
      console.error('Failed to check API status:', error);
      alert('Failed to check API status. See console for details.');
    }
  };

  const handleRegister = async () => {
    try {
      if (!userId) {
        alert('Please enter a User ID');
        return;
      }

      const result = await snapTradeService.registerUser(userId);
      console.log('Registration successful:', result);
      alert(`Registration successful!\nUser ID: ${result.userId}\nUser Secret: ${result.userSecret}`);
    } catch (error) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">SnapTrade Connection</h2>
        <button
          onClick={handleCheckStatus}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Check API Status
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Enter your User ID"
          />
        </div>
        <button
          onClick={handleRegister}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Register User
        </button>
      </div>
    </div>
  );
} 