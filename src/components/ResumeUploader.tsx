// components/ResumeUploader.tsx
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useResume } from '@/hooks/useResume';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ResumeUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    resume, 
    isLoading, 
    uploadResume, 
    isUploading, 
    deleteResume, 
    isDeleting,
    downloadResume,
    isDownloading
  } = useResume();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadResume(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading resume...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Resume Management
          </CardTitle>
          <CardDescription>
            {resume 
              ? 'Manage your uploaded resume or upload a new one' 
              : 'Upload your resume to start applying for jobs'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Resume Display */}
            {resume && (
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-green-900">{resume.file_name}</h3>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700 mb-1">
                        Uploaded {new Date(resume.uploaded_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-green-600">
                        <span className="bg-green-100 px-2 py-1 rounded">
                          {getFileExtension(resume.file_name)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResume()}
                      disabled={isDownloading}
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeleting}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            Delete Resume
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resume.file_name}"? 
                            This action cannot be undone and you won't be able to apply for jobs until you upload a new resume.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteResume()}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Resume
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {resume ? 'Upload New Resume' : 'Upload Your Resume'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <Button 
                    onClick={handleUploadClick} 
                    disabled={isUploading}
                    className="w-full sm:w-auto"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {resume ? 'Replace Resume' : 'Choose File'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Supported formats: PDF, DOC, DOCX</p>
                <p>• Maximum file size: 10MB</p>
                <p>• {resume ? 'Uploading a new resume will replace your current one' : 'Make sure your resume is up-to-date and formatted professionally'}</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resume Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Include relevant keywords from job descriptions to improve your ATS score</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Use a clean, professional format that's easy to read</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Keep your resume updated with your latest experience and skills</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>PDF format is recommended for consistent formatting across devices</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUploader;