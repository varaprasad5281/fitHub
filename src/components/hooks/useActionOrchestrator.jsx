/**
 * Action Orchestrator Hook
 * Handles:
 * - Pre-condition checks (auth, subscription, profile)
 * - Automatic routing based on pre-conditions
 * - Action execution
 * - Post-action routing
 * - Error handling
 */

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { wrapAsyncAction } from '@/components/utils/asyncActionWrapper';
import { useInteractionAudit } from '@/components/debug/InteractionAudit';

const DEBUG_AUDIT = () => {
  try {
    return localStorage.getItem('7pct_audit') === '1';
  } catch {
    return false;
  }
};

export function useActionOrchestrator() {
  const navigate = useNavigate();
  const { logAction } = useInteractionAudit();

  /**
   * Pre-condition checks
   * Returns: { passed: boolean, redirectTo: string }
   */
  const checkConditions = async (conditions) => {
    const { requireAuth = false, requireSubscription = false, requireProfile = false } = conditions;

    try {
      if (requireAuth) {
        const { api } = await import('@/api/client');
        const isAuth = await api.auth.isAuthenticated();
        if (!isAuth) {
          return {
            passed: false,
            redirectTo: '/login',
            reason: 'User not authenticated',
          };
        }
      }

      if (requireSubscription) {
        const { api } = await import('@/api/client');
        const user = await api.auth.me();
        const subs = await api.entities.Subscription.filter({ created_by: user?.email });
        const hasActiveSub = subs.some(s => s.status === 'active' || s.status === 'trial');
        
        if (!hasActiveSub) {
          return {
            passed: false,
            redirectTo: '/pricing',
            reason: 'Subscription required',
          };
        }
      }

      if (requireProfile) {
        const { api } = await import('@/api/client');
        const profiles = await api.entities.Profile.list();
        if (!profiles.length || !profiles[0].fitness_goal) {
          return {
            passed: false,
            redirectTo: '/onboarding',
            reason: 'Profile incomplete',
          };
        }
      }

      return { passed: true };
    } catch (err) {
      return {
        passed: false,
        redirectTo: null,
        reason: 'Condition check failed: ' + err.message,
      };
    }
  };

  /**
   * Execute an action with full orchestration
   */
  const executeAction = async (config) => {
    const {
      actionName = 'Action',
      conditions = {},
      asyncFn,
      onSuccess,
      onError,
      redirectOn = 'success', // 'success', 'always', 'never'
      redirectTo,
      setLoading,
    } = config;

    const actionId = Math.random();
    if (DEBUG_AUDIT()) {
      logAction(actionName, 'initiated', { actionId, conditions });
    }

    try {
      // 1. Check conditions
      const conditionResult = await checkConditions(conditions);
      
      if (!conditionResult.passed) {
        if (DEBUG_AUDIT()) {
          logAction(actionName, 'condition_failed', conditionResult);
        }

        // Redirect if condition failed and redirectTo is specified
        if (conditionResult.redirectTo) {
          toast.error(conditionResult.reason || 'Cannot complete action');
          navigate(conditionResult.redirectTo);
          return;
        }

        throw new Error(conditionResult.reason || 'Condition not met');
      }

      // 2. Execute action with wrapper
      const result = await wrapAsyncAction(
        actionName,
        asyncFn,
        {
          setLoading,
          timeout: 10000,
          showToast: !onError, // Don't show default toast if we have custom error handler
        }
      );

      if (DEBUG_AUDIT()) {
        logAction(actionName, 'success', { actionId, result });
      }

      // 3. Run success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // 4. Route based on success
      if (redirectOn === 'success' && redirectTo) {
        navigate(redirectTo);
      } else if (redirectOn === 'always' && redirectTo) {
        navigate(redirectTo);
      }

      return result;
    } catch (err) {
      if (DEBUG_AUDIT()) {
        logAction(actionName, 'error', { actionId, error: err.message });
      }

      if (onError) {
        onError(err);
      } else {
        toast.error(err.message || 'Action failed');
      }

      // Route on error if configured
      if (redirectOn === 'always' && redirectTo) {
        navigate(redirectTo);
      }

      throw err;
    }
  };

  /**
   * Quick action - just navigate with conditions check
   */
  const navigateTo = async (page, conditions = {}) => {
    const conditionResult = await checkConditions(conditions);
    
    if (!conditionResult.passed) {
      if (conditionResult.redirectTo) {
        toast.error(conditionResult.reason || 'Cannot access this page');
        navigate(conditionResult.redirectTo);
      }
      return;
    }

    navigate(page);
  };

  return {
    executeAction,
    navigateTo,
    checkConditions,
  };
}