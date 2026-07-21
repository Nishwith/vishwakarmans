import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Logs a view to project_views_log when projectId changes.
 * Auth-guarded: silently skips for anonymous visitors (prevents
 * 403 console noise since RLS blocks anon inserts).
 *
 * @param {number|string|null} projectId - designer_projects.id to log
 */
export const useLogProjectView = (projectId) => {
  const lastLogged = useRef(null);

  useEffect(() => {
    if (!projectId || projectId === lastLogged.current) return;

    const logView = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // ponytail: anon skip — RLS blocks them anyway

      lastLogged.current = projectId;
      await supabase
        .from('project_views_log')
        .insert({ project_id: projectId, viewer_id: session.user.id });
      // Fire-and-forget: don't block UI on analytics
    };

    logView();
  }, [projectId]);
};
