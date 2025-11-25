
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Search, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [userType, setUserType] = useState<'jobseeker' | 'hr' | null>(null);

  const features = [
    {
      icon: Users,
      title: "Professional Networking",
      description: "Connect with industry professionals and expand your network"
    },
    {
      icon: Briefcase,
      title: "Job Opportunities",
      description: "Discover and apply for jobs that match your skills"
    },
    {
      icon: Search,
      title: "Talent Discovery",
      description: "Find the perfect candidates for your organization"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Track your professional journey and achievements"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Smart algorithms connect the right people and opportunities"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">
                  INTELLIGENT HIRING SOFTWARE
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to the Future of
            <span className="text-blue-600 block">Professional Networking</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect with professionals, discover opportunities, and build your career 
            with our intelligent hiring platform designed for modern professionals.
          </p>
          
          {/* User Type Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                userType === 'jobseeker' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setUserType('jobseeker')}
            >
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Job Seekers</h3>
                <p className="text-gray-600 mb-6">
                  Find your dream job, build your professional profile, and connect with recruiters.
                </p>
                <Link to="/register?type=jobseeker">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Start Your Career Journey
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                userType === 'hr' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setUserType('hr')}
            >
              <CardContent className="p-8 text-center">
                <Briefcase className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-3">HR & Recruiters</h3>
                <p className="text-gray-600 mb-6">
                  Discover top talent, post jobs, and streamline your hiring process.
                </p>
                <Link to="/register?type=hr">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Find Top Talent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need for professional networking and hiring.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Professional Life?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust our platform for their career growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?type=jobseeker">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Join as Job Seeker
              </Button>
            </Link>
            <Link to="/register?type=hr">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                Join as Recruiter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">INTELLIGENT HIRING SOFTWARE</h3>
            <p className="text-gray-400 mb-6">
              Connecting talent with opportunity through intelligent technology.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
