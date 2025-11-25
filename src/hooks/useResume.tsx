// hooks/useResume.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useResume = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
        throw new Error('Please upload a PDF, DOC, or DOCX file');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }
      
      // Delete existing resume if it exists
      if (resume) {
        try {
          // Delete from storage
          await supabase.storage
            .from('resumes')
            .remove([resume.file_path]);
          
          // Delete from database
          await supabase
            .from('resumes')
            .delete()
            .eq('id', resume.id);
        } catch (error) {
          console.warn('Failed to delete old resume:', error);
          // Continue with upload even if deletion fails
        }
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Save to database
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      toast({
        title: "Resume uploaded successfully! ✅",
        description: "You can now apply for jobs with your new resume.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: async () => {
      if (!resume || !user?.id) throw new Error('No resume to delete');
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resume.file_path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resume.id);

      if (dbError) throw dbError;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      toast({
        title: "Resume deleted",
        description: "Upload a new resume to apply for jobs.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadResumeMutation = useMutation({
    mutationFn: async () => {
      if (!resume) throw new Error('No resume to download');

      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resume.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = resume.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Download started",
        description: "Your resume is being downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Download failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    resume,
    isLoading,
    uploadResume: uploadResumeMutation.mutate,
    isUploading: uploadResumeMutation.isPending,
    deleteResume: deleteResumeMutation.mutate,
    isDeleting: deleteResumeMutation.isPending,
    downloadResume: downloadResumeMutation.mutate,
    isDownloading: downloadResumeMutation.isPending,
  };
};