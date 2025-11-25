
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSavedJobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedJobs, isLoading } = useQuery({
    queryKey: ['saved-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          jobs:job_id (
            *
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const saveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .insert({
          job_id: jobId,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      toast({
        title: "Job saved",
        description: "Job has been saved to your list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "You have already saved this job." 
          : "Failed to save job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      toast({
        title: "Job unsaved",
        description: "Job has been removed from your saved list.",
      });
    },
  });

  return {
    savedJobs,
    isLoading,
    saveJob: saveJobMutation.mutate,
    unsaveJob: unsaveJobMutation.mutate,
  };
};
