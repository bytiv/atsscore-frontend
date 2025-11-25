
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useJobs = (searchTerm?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: myJobs } = useQuery({
    queryKey: ['my-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert({ ...jobData, posted_by: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      toast({
        title: "Job posted",
        description: "Your job has been posted successfully.",
      });
    },
  });

  return {
    jobs,
    myJobs,
    isLoading,
    createJob: createJobMutation.mutate,
  };
};
