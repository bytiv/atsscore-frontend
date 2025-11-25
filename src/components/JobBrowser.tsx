
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, Bookmark, BookmarkCheck, Briefcase } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useApplications } from '@/hooks/useApplications';
import { useSavedJobs } from '@/hooks/useSavedJobs';

const JobBrowser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { jobs, isLoading } = useJobs(searchTerm);
  const { applyToJob } = useApplications();
  const { saveJob, unsaveJob, savedJobs } = useSavedJobs();

  const isJobSaved = (jobId: string) => {
    return savedJobs?.some(saved => saved.job_id === jobId);
  };

  const handleSaveJob = (jobId: string) => {
    if (isJobSaved(jobId)) {
      unsaveJob(jobId);
    } else {
      saveJob(jobId);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading jobs...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs, companies, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {jobs?.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="text-lg font-medium">{job.company}</CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{job.type}</Badge>
                  {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{job.description}</p>
              
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={() => applyToJob(job.id)}
                  className="flex-1"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSaveJob(job.id)}
                >
                  {isJobSaved(job.id) ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobBrowser;
