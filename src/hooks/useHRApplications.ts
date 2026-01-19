// hooks/useHRApplications.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ATS_API_URL = 'https://atsscore-production-80d8.up.railway.app';
// new https://atsscore-production-8e0b.up.railway.app

export interface ApplicationWithDetails {
  application_id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  cover_letter: string | null;
  ats_score: number | null;
  predicted_category: string | null;
  confidence_score: number | null;
  ats_calculated_at: string | null;
  job_title: string;
  job_company: string;
  job_location: string;
  job_type: string;
  job_salary: string | null;
  job_description: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  applicant_company: string | null;
  applicant_position: string | null;
  resume_file_name: string | null;
  resume_file_path: string | null;
  resume_uploaded_at: string | null;
}

export const useHRApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query the view directly. Some deployments may not have the RPC
      // function `get_hr_applications_with_ats`, but the `hr_applications_view`
      // should be available (as you queried manually).
      const { data, error } = await (supabase as any)
        .from('hr_applications_view')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error) throw error;

      const normalized = (data || []).map((row: any) => ({
        application_id: row.application_id,
        job_id: row.job_id,
        user_id: row.user_id,
        status: row.status,
        applied_at: row.applied_at,
        cover_letter: row.cover_letter ?? null,
        ats_score: row.ats_score === null || row.ats_score === undefined ? null : Number(row.ats_score),
        predicted_category: row.predicted_category ?? null,
        confidence_score: row.confidence_score === null || row.confidence_score === undefined ? null : Number(row.confidence_score),
        ats_calculated_at: row.ats_calculated_at ?? null,
        job_title: row.job_title ?? '',
        job_company: row.job_company ?? '',
        job_location: row.job_location ?? '',
        job_type: row.job_type ?? '',
        job_salary: row.job_salary ?? null,
        job_description: row.job_description ?? '',
        first_name: row.first_name ?? '',
        last_name: row.last_name ?? '',
        email: row.email ?? null,
        phone: row.phone ?? null,
        applicant_company: row.applicant_company ?? null,
        applicant_position: row.applicant_position ?? null,
        resume_file_name: row.resume_file_name ?? null,
        resume_file_path: row.resume_file_path ?? null,
        resume_uploaded_at: row.resume_uploaded_at ?? null,
      })) as ApplicationWithDetails[];

      setApplications(normalized);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.application_id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating application status:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'An error occurred' 
      };
    }
  };

  const calculateAtsScore = async (applicationId: string, jobDescription: string, resumeFilePath: string) => {
    try {
      setLoading(true);

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

      setApplications(prev => 
        prev.map(app => 
          app.application_id === applicationId 
            ? { 
                ...app, 
                ats_score: result.ats_score,
                predicted_category: result.predicted_category,
                confidence_score: result.confidence,
                ats_calculated_at: new Date().toISOString()
              }
            : app
        )
      );

      return { success: true, data: result };
    } catch (err) {
      console.error('Error calculating ATS score:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'An error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getResumeDownloadUrl = async (filePath: string) => {
    if (!filePath) return null;
    
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting resume download URL:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    updateApplicationStatus,
    calculateAtsScore,
    getResumeDownloadUrl
  };
};