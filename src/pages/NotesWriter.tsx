import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApiKey } from '../lib/ApiKeyContext';
import { useToast } from '../components/ui/use-toast';
import { useSessionStorage } from '../lib/useSessionStorage';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import { Loader2, Check, ExternalLink } from 'lucide-react';
import LoadingModal from '../components/ui/LoadingModal';
import ApiKeyModal from '../components/ui/ApiKeyModal';

interface FormData {
  unitTitle: string;
  topics: string;
}

interface TopicContent {
  topic: string;
  content: string;
}

export default function NotesWriter() {
  const { geminiKey } = useApiKey();
  const { toast } = useToast();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Use sessionStorage for form data
  const [formData, setFormData] = useSessionStorage('notes-writer-form', {
    unitTitle: '',
    topics: ''
  });
  
  // Use sessionStorage for generated content
  const [generatedNotes, setGeneratedNotes] = useSessionStorage<string>('notes-writer-generated', '');
  const [topicContents, setTopicContents] = useSessionStorage<Array<{ topic: string; content: string }>>('notes-writer-topics', []);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const generateTopicPrompt = (topic: string, context: { unitTitle: string }) => {
    return `Generate comprehensive study notes for the topic "${topic}" within the unit "${context.unitTitle}".
Use markdown formatting for better readability and structure.

Please provide detailed, well-structured content that includes:
1. A brief overview of the topic
2. Key concepts and principles
3. Examples and illustrations where applicable
4. Important points to remember
5. Common misconceptions or challenges
6. Practice questions or exercises (if relevant)

Format the content using markdown with:
1. Clear headings using ### for sub-topics
2. Bullet points and numbered lists where appropriate
3. **Bold** and *italic* text for emphasis
4. Code blocks with proper syntax highlighting (if needed)
5. Tables where relevant
6. > Blockquotes for important notes or definitions

Structure your response with these sections:
### Overview
[Brief overview of the topic]

### Key Concepts
[Explanation of main concepts]

### Examples
[Practical examples]

### Important Points
[Key takeaways]

If applicable, also include:
### Common Misconceptions
### Practice Questions

DO NOT include a heading for the topic itself, as I will add it separately.
Start directly with the content.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if (!formData.unitTitle || !formData.topics) {
      toast({
        title: "Missing Information",
        description: "Please enter both unit title and topics.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setShowLoadingModal(true);
    setTopicContents([]);
    setCompletedSections([]);
    setGeneratedNotes(''); // Clear existing content
    
    // Split topics and clean them
    const topics = formData.topics.split(',').map(topic => topic.trim()).filter(Boolean);
    let allContent = [`# ${formData.unitTitle}\n`]; // Start with the title
    const newTopicContents: TopicContent[] = [];
    
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
      
      // Process each topic sequentially
      for (const topic of topics) {
        setCurrentSection(topic);
        const prompt = generateTopicPrompt(topic, { unitTitle: formData.unitTitle });
        
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const content = response.text();
          
          // Add topic heading and content to our array
          allContent.push(`\n\n## ${topic}\n\n${content}`);
          
          // Store the topic content for the preview
          newTopicContents.push({ topic, content });
          
          // Update states
          setCompletedSections(prev => [...prev, topic]);
        } catch (error) {
          console.error('Error generating notes:', error);
          // Use a type guard to safely access error.message
          let errorMessage = '';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = String((error as { message: unknown }).message);
          } else {
            errorMessage = String(error);
          }
          
          if (errorMessage.includes('API key')) {
            toast({
              title: "Invalid API Key",
              description: "Please check your Gemini API key and try again.",
              variant: "destructive"
            });
            setShowApiKeyModal(true);
          } else {
            toast({
              title: "Generation Failed",
              description: "Failed to generate notes. Please try again.",
              variant: "destructive"
            });
          }
        }
      }
      
      // Update the generated content and topic contents
      setGeneratedNotes(allContent.join(''));
      setTopicContents(newTopicContents);
      
      // Show success modal instead of toast
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowLoadingModal(false);
      setCurrentSection(null);
    }
  };

  // Add a new function to open preview in a new tab
  const handlePreviewInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>${formData.unitTitle || 'Study Notes Preview'}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
              body {
                background-color: #ffffff;
                margin: 0;
                padding: 0;
                color: #24292e;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                line-height: 1.6;
              }
              .control-bar {
                position: sticky;
                top: 0;
                background-color: #f6f8fa;
                border-bottom: 1px solid #e1e4e8;
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 100;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
              }
              .instruction {
                font-size: 14px;
                color: #57606a;
                margin-right: 10px;
              }
              .buttons {
                display: flex;
                gap: 8px;
              }
              .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                background-color: #ffffff;
                border: 1px solid #d1d5da;
                border-radius: 6px;
                padding: 6px 12px;
                font-size: 14px;
                font-weight: 500;
                color: #24292e;
                cursor: pointer;
                transition: all 0.2s;
              }
              .btn:hover {
                background-color: #f3f4f6;
              }
              .btn i {
                font-size: 14px;
              }
              .btn-success {
                background-color: #2ea44f;
                color: white;
                border-color: #2ea44f;
              }
              .btn-success:hover {
                background-color: #2c974b;
              }
              .markdown-body {
                box-sizing: border-box;
                min-width: 200px;
                max-width: 980px;
                margin: 0 auto;
                padding: 45px;
                background-color: #ffffff;
                color: #24292e;
                border: 1px solid #e1e4e8;
                border-radius: 6px;
                margin-top: 20px;
                margin-bottom: 40px;
              }
              .markdown-body h1, 
              .markdown-body h2, 
              .markdown-body h3, 
              .markdown-body h4, 
              .markdown-body h5, 
              .markdown-body h6,
              .markdown-body p,
              .markdown-body li,
              .markdown-body a,
              .markdown-body code,
              .markdown-body blockquote {
                color: #24292e;
              }
              .markdown-body pre {
                background-color: #f6f8fa;
              }
              .markdown-body code {
                background-color: #f6f8fa;
                color: #24292e;
                word-wrap: break-word;
                white-space: pre-wrap;
              }
              .markdown-body table {
                border-collapse: collapse;
                display: block;
                width: 100%;
                overflow-x: auto;
              }
              .markdown-body table th,
              .markdown-body table td {
                border: 1px solid #e1e4e8;
                padding: 6px 13px;
              }
              .markdown-body table tr {
                background-color: #ffffff;
                border-top: 1px solid #e1e4e8;
              }
              .markdown-body table tr:nth-child(2n) {
                background-color: #f6f8fa;
              }
              .markdown-body img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1rem auto;
              }
              .markdown-body blockquote {
                border-left: 4px solid #dfe2e5;
                padding: 0 1em;
                color: #6a737d;
              }
              @media (max-width: 767px) {
                .markdown-body {
                  padding: 20px;
                  margin: 10px;
                  border-radius: 4px;
                  font-size: 16px;
                  width: auto;
                }
                .markdown-body h1 {
                  font-size: 1.8rem;
                  word-break: break-word;
                }
                .markdown-body h2 {
                  font-size: 1.5rem;
                }
                .markdown-body h3 {
                  font-size: 1.3rem;
                }
                .markdown-body pre {
                  padding: 12px;
                  border-radius: 4px;
                }
                .control-bar {
                  padding: 10px;
                  flex-direction: column;
                  align-items: flex-start;
                }
                .instruction {
                  font-size: 13px;
                  margin-bottom: 10px;
                  width: 100%;
                }
                .buttons {
                  width: 100%;
                  justify-content: space-between;
                }
                .btn {
                  padding: 8px 12px;
                  font-size: 14px;
                  flex: 1;
                  justify-content: center;
                }
                .btn i {
                  margin-right: 4px;
                }
              }
              /* Override any dark mode settings */
              html, body {
                background-color: #ffffff !important;
                color: #24292e !important;
              }
              /* Hide control bar when printing */
              @media print {
                .control-bar {
                  display: none !important;
                }
                .markdown-body {
                  margin-top: 0;
                  padding-top: 0;
                  border: none;
                  max-width: 100%;
                }
                body {
                  background-color: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="control-bar">
              <div class="instruction">
                <i class="fas fa-info-circle"></i> Copy and paste this in Google Docs or Word to preserve formatting. Google Docs is recommended.
              </div>
              <div class="buttons">
                <button id="copyBtn" class="btn">
                  <i class="fas fa-copy"></i> Copy
                </button>
                <button id="printBtn" class="btn">
                  <i class="fas fa-download"></i> Download
                </button>
              </div>
            </div>
            <div class="markdown-body">
              <div id="content"></div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            <script>
              // Parse and render markdown
              marked.setOptions({
                breaks: true,
                gfm: true
              });
              const markdownContent = ${JSON.stringify(generatedNotes)};
              document.getElementById('content').innerHTML = marked.parse(markdownContent);
              
              // Copy button functionality - copy the rendered HTML content
              document.getElementById('copyBtn').addEventListener('click', async () => {
                try {
                  // Get the rendered HTML content
                  const contentElement = document.querySelector('.markdown-body');
                  
                  // Create a range and selection
                  const range = document.createRange();
                  range.selectNode(contentElement);
                  
                  // Select the content
                  const selection = window.getSelection();
                  selection.removeAllRanges();
                  selection.addRange(range);
                  
                  // Execute copy command
                  document.execCommand('copy');
                  
                  // Clear selection
                  selection.removeAllRanges();
                  
                  // Update button to show success
                  const btn = document.getElementById('copyBtn');
                  btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                  btn.classList.add('btn-success');
                  setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    btn.classList.remove('btn-success');
                  }, 2000);
                } catch (err) {
                  console.error('Failed to copy content:', err);
                }
              });
              
              // Print button functionality (renamed to Download but keeps print functionality)
              document.getElementById('printBtn').addEventListener('click', () => {
                window.print();
              });
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // Success Modal Component
  const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    useEffect(() => {
      if (isOpen) {
        // Load and trigger confetti when modal opens
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.async = true;
        script.onload = () => {
          const confetti = (window as any).confetti;
          
          // Initial burst of confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          // Followed by a cannon from both sides
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            });
            
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            });
          }, 250);
        };
        document.body.appendChild(script);
        
        return () => {
          // Clean up script when modal closes
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      }
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Notes Generated!</h2>
            <p className="text-gray-600 mb-6">
              Your study notes have been successfully generated with {topicContents.length} topics.
            </p>
            <div className="flex flex-col w-full gap-3">
              <Button 
                onClick={() => {
                  handlePreviewInNewTab();
                  onClose();
                }}
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View/Download Notes
              </Button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-sm mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Study Notes Generator</h1>
      
      <LoadingModal
        isOpen={showLoadingModal}
        sections={formData.topics.split(',').map(topic => topic.trim())}
        currentSection={currentSection}
        completedSections={completedSections}
      />
      
      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
      
      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              label="Unit Title"
              value={formData.unitTitle}
              onChange={(e) => setFormData({
                ...formData,
                unitTitle: e.target.value
              })}
              placeholder="e.g., Data Structures and Algorithms"
            />
          </div>
          
          <div className="space-y-2">
            <TextArea
              label="Topics (comma-separated)"
              value={formData.topics}
              onChange={(e) => setFormData({
                ...formData,
                topics: e.target.value
              })}
              placeholder="e.g., Arrays, Linked Lists, Binary Trees"
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Notes...</span>
              </>
            ) : (
              'Generate Notes'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}