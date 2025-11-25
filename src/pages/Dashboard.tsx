// components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Briefcase, TrendingUp, Plus, Upload, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useApplications } from '@/hooks/useApplications';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { useJobs } from '@/hooks/useJobs';
import { useHRApplications } from '@/hooks/useHRApplications';
import JobBrowser from '@/components/JobBrowser';
import ProfileEditor from '@/components/ProfileEditor';
import ResumeUploader from '@/components/ResumeUploader';
import JobPostForm from '@/components/JobPostForm';
import ThemeSettings from '@/components/ThemeSettings';
import ApplicationsViewer from '@/components/ApplicationsViewer';
import SavedJobs from '@/components/SavedJobs';
import { useNavigate } from 'react-router-dom'; 

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { myApplications } = useApplications();
  const { savedJobs } = useSavedJobs();
  const { myJobs } = useJobs();
  const { applications: hrApplications } = useHRApplications();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleSignOut = async () => {
    await signOut();
    navigate('/'); 
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const userType = profile.user_type as 'jobseeker' | 'hr';

  const jobSeekerStats = [
    { label: 'Profile Views', value: '0', icon: Users, trend: 'No data yet' },
    { label: 'Applications', value: myApplications?.length.toString() || '0', icon: Briefcase, trend: `${myApplications?.length || 0} total` },
    { label: 'Saved Jobs', value: savedJobs?.length.toString() || '0', icon: TrendingUp, trend: `${savedJobs?.length || 0} saved` },
  ];

  const hrStats = [
    { label: 'Active Jobs', value: myJobs?.length.toString() || '0', icon: Briefcase, trend: `${myJobs?.length || 0} posted` },
    { label: 'Total Applications', value: hrApplications?.length.toString() || '0', icon: Users, trend: `${hrApplications?.length || 0} received` },
    { label: 'Views', value: '0', icon: TrendingUp, trend: 'No data yet' },
  ];

  const stats = userType === 'jobseeker' ? jobSeekerStats : hrStats;

  const recentActivity = userType === 'jobseeker' ? 
    myApplications?.slice(0, 3).map(app => ({
      type: 'application',
      text: `Applied to ${app.jobs?.title} at ${app.jobs?.company}`,
      time: new Date(app.applied_at).toLocaleDateString()
    })) || [] :
    myJobs?.slice(0, 3).map(job => ({
      type: 'job_post',
      text: `Posted ${job.title} position`,
      time: new Date(job.created_at).toLocaleDateString()
    })) || [];

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return userType === 'jobseeker' ? <JobBrowser /> : null;
      case 'saved':
        return userType === 'jobseeker' ? <SavedJobs /> : null;
      case 'applications':
        return userType === 'hr' ? <ApplicationsViewer /> : null;
      case 'profile':
        return <ProfileEditor />;
      case 'resume':
        return userType === 'jobseeker' ? <ResumeUploader /> : null;
      case 'post-job':
        return userType === 'hr' ? <JobPostForm /> : null;
      case 'settings':
        return <ThemeSettings />;
      default:
        return (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    {userType === 'jobseeker' 
                      ? "Boost your profile and job search" 
                      : "Manage your recruitment process"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userType === 'jobseeker' ? (
                      <>
                        <Button 
                          className="h-20 flex flex-col items-center justify-center space-y-2"
                          onClick={() => setActiveTab('resume')}
                        >
                          <Upload className="h-6 w-6" />
                          <span>Update Resume</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center space-y-2"
                          onClick={() => setActiveTab('jobs')}
                        >
                          <Briefcase className="h-6 w-6" />
                          <span>Browse Jobs</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center space-y-2"
                          onClick={() => setActiveTab('saved')}
                        >
                          <TrendingUp className="h-6 w-6" />
                          <span>Saved Jobs</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="h-20 flex flex-col items-center justify-center space-y-2"
                          onClick={() => setActiveTab('post-job')}
                        >
                          <Plus className="h-6 w-6" />
                          <span>Post New Job</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center space-y-2"
                          onClick={() => setActiveTab('applications')}
                        >
                          <Users className="h-6 w-6" />
                          <span>View Applications</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Jobs/Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {userType === 'jobseeker' ? 'My Applications' : 'My Job Posts'}
                  </CardTitle>
                  <CardDescription>
                    {userType === 'jobseeker' 
                      ? 'Track your job applications' 
                      : 'Manage your job postings'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userType === 'jobseeker' ? (
                      myApplications?.slice(0, 5).map((application) => (
                        <div key={application.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{application.jobs?.title}</h3>
                              <p className="text-gray-600">{application.jobs?.company}</p>
                              <p className="text-sm text-gray-500">{application.jobs?.location}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                application.status === 'accepted' ? 'default' :
                                application.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }>
                                {application.status}
                              </Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(application.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      myJobs?.slice(0, 5).map((job) => (
                        <div key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{job.title}</h3>
                              <p className="text-gray-600">{job.company}</p>
                              <p className="text-sm text-gray-500">{job.location}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{job.type}</Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(job.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {((userType === 'jobseeker' && (!myApplications || myApplications.length === 0)) ||
                      (userType === 'hr' && (!myJobs || myJobs.length === 0))) && (
                      <p className="text-gray-500 text-center py-8">
                        {userType === 'jobseeker' ? 'No applications yet' : 'No job posts yet'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                  <CardDescription>Complete your profile to get better matches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>✓ Basic Information</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>✓ Contact Details</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500">
                        <span>○ Professional Experience</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500">
                        <span>○ Skills & Certifications</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTab('profile')}
                    >
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest platform interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index}>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.text}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        {index < recentActivity.length - 1 && <Separator className="my-3" />}
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No recent activity
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-blue-600">
                INTELLIGENT HIRING SOFTWARE
              </h1>
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`text-sm font-medium ${
                    activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                {userType === 'jobseeker' && (
                  <>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className={`text-sm font-medium ${
                        activeTab === 'jobs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Browse Jobs
                    </button>
                    <button
                      onClick={() => setActiveTab('saved')}
                      className={`text-sm font-medium ${
                        activeTab === 'saved' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Saved Jobs
                    </button>
                    <button
                      onClick={() => setActiveTab('resume')}
                      className={`text-sm font-medium ${
                        activeTab === 'resume' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Resume
                    </button>
                  </>
                )}
                {userType === 'hr' && (
                  <>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className={`text-sm font-medium ${
                        activeTab === 'applications' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Applications
                    </button>
                    <button
                      onClick={() => setActiveTab('post-job')}
                      className={`text-sm font-medium ${
                        activeTab === 'post-job' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Post Job
                    </button>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                      <AvatarFallback>
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => setActiveTab('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back, {profile.first_name}!
              </h2>
              <p className="text-muted-foreground">
                {userType === 'jobseeker' 
                  ? "Here's what's happening with your job search today." 
                  : "Here's an overview of your recruitment activities."}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-green-600">{stat.trend}</p>
                      </div>
                      <stat.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;