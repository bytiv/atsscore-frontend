// components/ApplicationsViewer.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Download,
  Eye,
  Check,
  X,
  Clock,
  Loader2,
  Building,
  Briefcase,
  Target
} from 'lucide-react';
import { useHRApplications, type ApplicationWithDetails } from '@/hooks/useHRApplications';

const ApplicationsViewer = () => {
  const { 
    applications, 
    loading, 
    error, 
    updateApplicationStatus, 
    calculateAtsScore,
    getResumeDownloadUrl 
  } = useHRApplications();
  
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
  const [atsCalculating, setAtsCalculating] = useState<string | null>(null);

  // Get unique jobs for filter
  const uniqueJobs = Array.from(
    new Set(applications.map(app => app.job_id))
  ).map(jobId => {
    const app = applications.find(a => a.job_id === jobId);
    return app ? {
      id: app.job_id,
      title: app.job_title,
      company: app.job_company
    } : null;
  }).filter(Boolean);

  // Filter applications based on selected criteria
  useEffect(() => {
    let filtered = applications;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    if (selectedJob !== 'all') {
      filtered = filtered.filter(app => app.job_id === selectedJob);
    }

    setFilteredApplications(filtered);
  }, [applications, selectedStatus, selectedJob]);

  const handleStatusUpdate = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    setStatusUpdateLoading(applicationId);
    
    const result = await updateApplicationStatus(applicationId, newStatus);
    
    if (result.success) {
      if (selectedApplication && selectedApplication.application_id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } else {
      console.error('Failed to update status:', result.error);
    }
    
    setStatusUpdateLoading(null);
  };

  const handleCalculateAts = async (application: ApplicationWithDetails) => {
    if (!application.resume_file_path) {
      alert('No resume found for this applicant');
      return;
    }

    setAtsCalculating(application.application_id);
    
    const result = await calculateAtsScore(
      application.application_id,
      application.job_description,
      application.resume_file_path
    );
    
    if (result.success) {
      if (selectedApplication && selectedApplication.application_id === application.application_id) {
        setSelectedApplication({
          ...selectedApplication,
          ats_score: result.data.ats_score,
          predicted_category: result.data.predicted_category,
          confidence_score: result.data.confidence,
          ats_calculated_at: new Date().toISOString()
        });
      }
    } else {
      alert('Failed to calculate ATS score: ' + result.error);
    }
    
    setAtsCalculating(null);
  };

  const handleResumeDownload = async (filePath: string, fileName: string) => {
    if (!filePath) return;
    
    const url = await getResumeDownloadUrl(filePath);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'reviewed': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAtsScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <X className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading applications
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedApplication) {
    const app = selectedApplication;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedApplication(null)}
          >
            ← Back to Applications
          </Button>
          <div className="flex gap-2">
            {!app.ats_score && app.resume_file_path && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCalculateAts(app)}
                disabled={atsCalculating === app.application_id}
              >
                {atsCalculating === app.application_id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                Calculate ATS Score
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(app.application_id, 'reviewed')}
              disabled={app.status === 'reviewed' || statusUpdateLoading === app.application_id}
            >
              {statusUpdateLoading === app.application_id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Mark as Reviewed
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusUpdate(app.application_id, 'accepted')}
              disabled={app.status === 'accepted' || statusUpdateLoading === app.application_id}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusUpdate(app.application_id, 'rejected')}
              disabled={app.status === 'rejected' || statusUpdateLoading === app.application_id}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Applicant Details */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {app.first_name[0]}{app.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {app.first_name} {app.last_name}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(app.status)} className="mt-1">
                      {getStatusIcon(app.status)}
                      <span className="ml-1 capitalize">{app.status}</span>
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${app.email}`} className="hover:underline">
                      {app.email}
                    </a>
                  </div>
                )}
                {app.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${app.phone}`} className="hover:underline">
                      {app.phone}
                    </a>
                  </div>
                )}
                {app.applicant_company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{app.applicant_company}</span>
                  </div>
                )}
                {app.applicant_position && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>{app.applicant_position}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Applied {formatDate(app.applied_at)}</span>
                </div>
                {app.resume_file_path && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleResumeDownload(app.resume_file_path!, app.resume_file_name || 'resume.pdf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ATS Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  ATS Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {app.ats_score !== null ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getAtsScoreColor(app.ats_score)}`}>
                        {app.ats_score?.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-500">Match Score</p>
                    </div>
                    
                    {app.predicted_category && (
                      <div>
                        <p className="text-sm font-medium">Predicted Category:</p>
                        <Badge variant="secondary">{app.predicted_category}</Badge>
                      </div>
                    )}
                    
                    {app.confidence_score && (
                      <div>
                        <p className="text-sm font-medium">Confidence:</p>
                        <p className="text-sm text-gray-600">{app.confidence_score?.toFixed(1)}%</p>
                      </div>
                    )}
                    
                    {app.ats_calculated_at && (
                      <p className="text-xs text-gray-500">
                        Calculated {formatDate(app.ats_calculated_at)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">ATS score not calculated</p>
                    {app.resume_file_path && (
                      <Button
                        size="sm"
                        onClick={() => handleCalculateAts(app)}
                        disabled={atsCalculating === app.application_id}
                      >
                        {atsCalculating === app.application_id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Target className="h-4 w-4 mr-2" />
                        )}
                        Calculate Now
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Application for {app.job_title}</CardTitle>
                <CardDescription>at {app.job_company}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {app.job_location}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {app.job_type}
                    </div>
                    {app.job_salary && (
                      <div className="col-span-2">
                        <span className="font-medium">Salary:</span> {app.job_salary}
                      </div>
                    )}
                  </div>
                  
                  {app.cover_letter && (
                    <div>
                      <h4 className="font-semibold mb-2">Cover Letter</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {app.cover_letter}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Job Description</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {app.job_description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Applications</h2>
          <p className="text-gray-600">
            Manage applications for your job postings
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Job Position</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {uniqueJobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications found
                </h3>
                <p className="text-gray-600">
                  {applications.length === 0 
                    ? "No applications have been submitted yet."
                    : "No applications match your current filters."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.application_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {application.first_name[0]}{application.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {application.first_name} {application.last_name}
                      </h3>
                      <p className="text-gray-600">
                        Applied for {application.job_title}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {application.job_location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(application.applied_at)}
                        </span>
                        {application.ats_score !== null && (
                          <span className={`flex items-center gap-1 font-medium ${getAtsScoreColor(application.ats_score)}`}>
                            <Target className="h-3 w-3" />
                            ATS: {application.ats_score.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        View Details
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStatusUpdate(application.application_id, 'accepted')}
                            disabled={statusUpdateLoading === application.application_id}
                          >
                            {statusUpdateLoading === application.application_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(application.application_id, 'rejected')}
                            disabled={statusUpdateLoading === application.application_id}
                          >
                            {statusUpdateLoading === application.application_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationsViewer;