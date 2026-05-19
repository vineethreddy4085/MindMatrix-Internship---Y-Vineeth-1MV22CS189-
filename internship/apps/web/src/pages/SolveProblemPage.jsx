import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import SolutionDisplay from '@/components/SolutionDisplay.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useUserProgress } from '@/hooks/useUserProgress.js';

const SolveProblemPage = () => {
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get('id');
  
  const { isAuthenticated } = useAuth();
  const { recordProblemSolved } = useUserProgress();
  
  const [files, setFiles] = React.useState([]);
  const [questionText, setQuestionText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [solution, setSolution] = React.useState(null);
  const [currentProblemId, setCurrentProblemId] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);

  // Load problem if ID is provided in URL
  useEffect(() => {
    if (problemId) {
      loadProblemFromDb(problemId);
    }
  }, [problemId]);

  const loadProblemFromDb = async (id) => {
    setIsLoading(true);
    try {
      const problem = await pb.collection('problems').getOne(id, { $autoCancel: false });
      setQuestionText(problem.description);
      setCurrentProblemId(id);
      
      // Auto-solve if loaded from DB
      setSolution(problem);
      
      if (isAuthenticated) {
        // Record as solved with random high accuracy for demo
        const accuracy = Math.floor(Math.random() * 20) + 80; // 80-100%
        await recordProblemSolved(id, accuracy);
        toast.success('Problem solved! Great job!');
      }
    } catch (error) {
      console.error("Error loading problem:", error);
      toast.error("Failed to load problem details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg'];
    const validFiles = newFiles.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== newFiles.length) {
      toast.error('Invalid file type. Please upload PDF, DOC, or image files only');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGetSolution = async () => {
    if (!questionText.trim() && files.length === 0) {
      toast.error('Please enter a question or upload a file');
      return;
    }

    setIsLoading(true);
    setSolution(null);

    try {
      // If we have a specific problem ID, just reload it
      if (currentProblemId) {
        await loadProblemFromDb(currentProblemId);
        return;
      }

      // Otherwise, simulate AI processing for custom input
      setTimeout(async () => {
        const mockSolution = {
          title: "Custom Problem Solution",
          difficulty: "Medium",
          topic: "General",
          timeToSolve: 5,
          steps: [
            {
              title: 'Analyze the input',
              description: 'First, we break down the provided text or image to understand the core requirements.'
            },
            {
              title: 'Formulate approach',
              description: 'Based on the analysis, we select the optimal algorithm or formula to apply.'
            },
            {
              title: 'Execute solution',
              description: 'Applying the method step-by-step to arrive at the final result.'
            }
          ],
          finalAnswer: 'Solution generated based on your custom input.',
          concepts: [
            {
              term: 'Problem Analysis',
              definition: 'The process of breaking down a complex problem into manageable parts.'
            }
          ]
        };

        setSolution(mockSolution);
        
        if (isAuthenticated) {
          toast.success('Problem solved! Great job!');
        }
        
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating solution:", error);
      toast.error("Failed to generate solution");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Solve problem - Problem Solver Hub</title>
        <meta name="description" content="Upload your questions or paste text to get detailed AI-powered solutions with step-by-step explanations." />
      </Helmet>

      <div className="min-h-screen py-12 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold leading-tight md:text-4xl tracking-tight">
                Solve your problem
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Upload files or paste your question to get detailed solutions
              </p>
            </div>

            <div className="space-y-6">
              {/* Input Area - Only show if not viewing a specific solution or if user wants to edit */}
              {!solution && (
                <>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Upload files</CardTitle>
                      <CardDescription>
                        Drag and drop or click to upload PDF, DOC, or image files
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
                          isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-accent/5'
                        }`}
                      >
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">
                          Drop files here or click to browse
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Supports PDF, DOC, PNG, JPG
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg border bg-background/50 p-3"
                            >
                              <div className="flex items-center gap-3">
                                {file.type.startsWith('image/') ? (
                                  <ImageIcon className="h-5 w-5 text-primary" />
                                ) : (
                                  <FileText className="h-5 w-5 text-secondary" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Or paste your question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Enter your question, code snippet, or error message here..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="min-h-[150px] resize-y bg-background/50 text-base"
                      />
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleGetSolution}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      'Processing...'
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Solution
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Loading State */}
              {isLoading && <LoadingSpinner text="Analyzing problem and generating step-by-step solution..." />}

              {/* Solution Display */}
              {solution && !isLoading && (
                <div className="space-y-6">
                  {/* Show original question if we have a solution */}
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="p-4 flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Original Problem</h3>
                        <p className="text-sm line-clamp-2">{questionText || solution.title || "Custom uploaded problem"}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { setSolution(null); setCurrentProblemId(null); }}>
                        Edit Input
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <SolutionDisplay solution={solution} problemId={currentProblemId} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SolveProblemPage;