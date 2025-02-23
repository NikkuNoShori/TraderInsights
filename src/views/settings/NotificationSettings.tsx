import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField } from '../../components/ui/form-field';
import { Button } from '../../components/ui/button';
import { toast } from 'react-hot-toast';
import { useSupabaseClient } from '../../hooks/useSupabaseClient';

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  trade_alerts: z.boolean(),
  performance_updates: z.boolean(),
  market_news: z.boolean(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationSettings() {
  const { supabase, user } = useSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: true,
      trade_alerts: true,
      performance_updates: true,
      market_news: false,
    }
  });

  const onSubmit = async (data: NotificationFormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          notification_settings: data
        });

      if (error) throw error;
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            type="checkbox"
            label="Email Notifications"
            {...register('email_notifications')}
            error={errors.email_notifications?.message}
          />

          <FormField
            type="checkbox"
            label="Trade Alerts"
            {...register('trade_alerts')}
            error={errors.trade_alerts?.message}
          />

          <FormField
            type="checkbox"
            label="Performance Updates"
            {...register('performance_updates')}
            error={errors.performance_updates?.message}
          />

          <FormField
            type="checkbox"
            label="Market News"
            {...register('market_news')}
            error={errors.market_news?.message}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 