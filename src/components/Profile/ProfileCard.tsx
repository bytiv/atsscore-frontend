
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, Briefcase, Settings } from 'lucide-react';

interface ProfileCardProps {
  user: {
    name: string;
    title: string;
    company: string;
    location: string;
    connections: number;
    avatar?: string;
    skills: string[];
  };
  isOwnProfile?: boolean;
}

const ProfileCard = ({ user, isOwnProfile = false }: ProfileCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="text-center">
        <div className="relative mx-auto">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-lg">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.title}</p>
          <p className="text-sm text-gray-500">{user.company}</p>
          <p className="text-sm text-gray-500">{user.location}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          {user.connections} connections
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Skills</p>
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {user.skills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{user.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {isOwnProfile ? (
            <Button className="w-full" variant="outline">
              <Briefcase className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="space-y-2">
              <Button className="w-full">Connect</Button>
              <Button className="w-full" variant="outline">Message</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
