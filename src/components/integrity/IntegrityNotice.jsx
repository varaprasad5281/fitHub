import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

export default function IntegrityNotice({ integrity }) {
  if (!integrity || integrity.integrity_status === 'normal') {
    return null;
  }

  const messages = {
    flagged: {
      title: '⚠️ Leaderboard Review',
      desc: 'Your leaderboard eligibility is under review due to unusual activity patterns. This is a routine check.',
      icon: AlertCircle,
      color: 'border-yellow-500 bg-yellow-500/10'
    },
    hidden: {
      title: '🔒 Currently Hidden',
      desc: 'Your leaderboard profile is temporarily hidden while we review your account activity.',
      icon: AlertCircle,
      color: 'border-orange-500 bg-orange-500/10'
    },
    suspended: {
      title: '⛔ Account Suspended',
      desc: 'Your account has been temporarily suspended pending review.',
      icon: AlertCircle,
      color: 'border-red-500 bg-red-500/10'
    }
  };

  const config = messages[integrity.integrity_status] || messages.flagged;
  const Icon = config.icon;

  return (
    <Alert className={`${config.color} border-2`}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>
        {config.desc}
        {integrity.integrity_status !== 'normal' && (
          <>
            <p className="mt-2 text-sm">Integrity Score: {integrity.integrity_score}/100</p>
            <p className="text-xs text-zinc-500 mt-1">
              Questions? <a href={`mailto:support@7percent.com?subject=Leaderboard+Review`} className="underline">Contact support</a>
            </p>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}