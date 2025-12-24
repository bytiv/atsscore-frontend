// hooks/useApplications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ATS_API_URL = 'https://atsscore-production-1ce3.up.railway.app';

export interface JobSeekerApplication {
  id: string;
  job_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  cover_letter: string | null;
  ats_score: number | null;
  predicted_category: string | null;
  confidence_score: number | null;
  ats_calculated_at: string | null;
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string | null;
    description: string;
  };
}

export const useApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myApplications = [], isLoading } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          status,
          applied_at,
          cover_letter,
          ats_score,
          predicted_category,
          confidence_score,
          ats_calculated_at,
          jobs:job_id (
            id,
            title,
            company,
            location,
            type,
            salary,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const applyToJobMutation = useMutation({
    mutationFn: async ({ jobId, jobDescription, coverLetter }: { 
      jobId: string; 
      jobDescription: string; 
      coverLetter?: string;
    }) => {
      if (!user?.id) {
        throw new Error('Please log in to apply for jobs');
      }

      // ALWAYS check for resume first - this is the key validation
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('file_path, file_name')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resumeError || !resumeData || !resumeData.file_path) {
        throw new Error('RESUME_REQUIRED');
      }

      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingApplication) {
        throw new Error('You have already applied to this job!');
      }

      // Create the application
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          status: 'pending',
          cover_letter: coverLetter || null
        })
        .select('id')
        .single();

      if (applicationError) throw applicationError;

      // Calculate ATS score in background
      try {
        await calculateAndSaveAtsScore(
          applicationData.id,
          jobDescription,
          resumeData.file_path
        );
      } catch (atsError) {
        console.error('ATS calculation failed:', atsError);
        // Don't fail the application for ATS errors
      }

      return applicationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Application submitted successfully! 🎉",
        description: "Your ATS score is being calculated...",
      });
    },
    onError: (error: Error) => {
      if (error.message === 'RESUME_REQUIRED') {
        toast({
          title: "Resume Required",
          description: "Please first upload your resume before applying to jobs.",
          variant: "destructive",
        });
      } else if (error.message.includes('already applied')) {
        toast({
          title: "Already Applied",
          description: "You have already applied to this job!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Application Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const calculateAndSaveAtsScore = async (
    applicationId: string,
    jobDescription: string,
    resumeFilePath: string
  ) => {
    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('resumes')
        .download(resumeFilePath);

      if (downloadError) throw downloadError;

      const formData = new FormData();
      formData.append('job_description', jobDescription);
      formData.append('resume_file', fileData);

      const response = await fetch(`${ATS_API_URL}/analyze-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ATS score');
      }

      const result = await response.json();

      const { error: updateError } = await supabase
        .from('applications')
        .update({
          ats_score: result.ats_score,
          predicted_category: result.predicted_category,
          confidence_score: result.confidence,
          ats_calculated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Show ATS score notification
      toast({
        title: `ATS Score calculated: ${result.ats_score.toFixed(1)}%`,
        description: `Category: ${result.predicted_category}`,
      });

      // Refresh applications to show updated ATS score
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      return result;
    } catch (err) {
      console.error('Error in calculateAndSaveAtsScore:', err);
      throw err;
    }
  };

  const applyToJob = (jobId: string, jobDescription: string, coverLetter?: string) => {
    applyToJobMutation.mutate({ jobId, jobDescription, coverLetter });
  };

  return {
    myApplications,
    loading: isLoading,
    error: null,
    applyToJob,
    isApplying: applyToJobMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['applications'] })
  };
};
