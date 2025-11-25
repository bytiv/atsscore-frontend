// components/SavedJobs.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  Heart, 
  ExternalLink,
  Trash2,
  Loader2
} from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { supabase } from '@/integrations/supabase/client';

interface SavedJob {
  id: string;
  job_id: string;
  saved_at: string;
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string | null;
    description: string;
    created_at: string;
  };
}

const SavedJobs = () => {
  const { savedJobs, loading, error, refetch } = useSavedJobs();
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);

  const handleRemoveFromSaved = async (savedJobId: string) => {
    setRemovingJobId(savedJobId);
    
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId);

      if (error) throw error;

      // Refresh the saved jobs list
      refetch();
    } catch (err) {
      console.error('Error removing saved job:', err);
    } finally {
      setRemovingJobId(null);
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          alert('You have already applied to this job!');
        } else {
          throw error;
        }
      } else {
        alert('Application submitted successfully!');
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      alert('Failed to submit application. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading saved jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <ExternalLink className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading saved jobs
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={refetch} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedJob) {
    const job = selectedJob.jobs;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedJob(null)}
          >
            ← Back to Saved Jobs
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleRemoveFromSaved(selectedJob.id)}
              disabled={removingJobId === selectedJob.id}
            >
              {removingJobId === selectedJob.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove from Saved
            </Button>
            <Button
              onClick={() => handleApplyToJob(job.id)}
            >
              Apply Now
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="text-lg mt-1">
                  <Building className="inline h-4 w-4 mr-1" />
                  {job.company}
                </CardDescription>
              </div>
              <Badge className={getJobTypeColor(job.type)}>
                {job.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>{job.salary}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Posted {formatDate(job.created_at)}</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3">Job Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Saved on {formatDate(selectedJob.saved_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saved Jobs</h2>
          <p className="text-gray-600">
            Jobs you've saved for later review
          </p>
        </div>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved jobs yet
              </h3>
              <p className="text-gray-600 mb-4">
                When you find jobs you're interested in, save them here to review later.
              </p>
              <Button variant="outline">
                Browse Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {savedJobs.map((savedJob) => {
            const job = savedJob.jobs;
            return (
              <Card key={savedJob.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 mb-2 flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {job.company}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </span>
                            {job.salary && (
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {job.salary}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Saved {formatDate(savedJob.saved_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 line-clamp-2">
                            {job.description.length > 150 
                              ? `${job.description.substring(0, 150)}...` 
                              : job.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getJobTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedJob(savedJob)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApplyToJob(job.id)}
                      >
                        Apply Now
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromSaved(savedJob.id);
                      }}
                      disabled={removingJobId === savedJob.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {removingJobId === savedJob.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;