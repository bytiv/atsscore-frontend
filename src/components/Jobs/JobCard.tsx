
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, MapPin, Clock, Users } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
    posted: string;
    applicants?: number;
    description: string;
    requirements: string[];
    companyLogo?: string;
  };
  userType?: 'jobseeker' | 'hr';
}

const JobCard = ({ job, userType = 'jobseeker' }: JobCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={job.companyLogo} />
            <AvatarFallback>
              {job.company.split(' ').map(word => word[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <p className="text-gray-600 font-medium">{job.company}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {job.posted}
              </div>
              {job.applicants && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {job.applicants} applicants
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary">{job.type}</Badge>
            {job.salary && (
              <p className="text-sm font-medium text-gray-900 mt-1">{job.salary}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 line-clamp-3">{job.description}</p>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Key Requirements:</p>
          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 4).map((req, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
            {job.requirements.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{job.requirements.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          {userType === 'jobseeker' ? (
            <>
              <Button className="flex-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button variant="outline">Save</Button>
            </>
          ) : (
            <>
              <Button className="flex-1">View Applications</Button>
              <Button variant="outline">Edit Job</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
