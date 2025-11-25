
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobs } from '@/hooks/useJobs';

const JobPostForm = () => {
  const { createJob } = useJobs();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    requirements: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob({
      ...formData,
      requirements: formData.requirements.split(',').map(req => req.trim()).filter(Boolean),
    });
    setFormData({
      title: '',
      company: '',
      location: '',
      type: '',
      salary: '',
      description: '',
      requirements: '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post New Job</CardTitle>
        <CardDescription>Create a new job posting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Job Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="requirements">Requirements (comma-separated)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              placeholder="React, TypeScript, 3+ years experience"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Post Job
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobPostForm;
