import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/AuthContext';
import { useApiKey } from '../lib/ApiKeyContext';

const LinkedInSummary = () => {
  const { user } = useAuth();
  const { geminiKey } = useApiKey();

  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    industry: '',
    experience: '',
    skills: '',
    careerGoals: '',
    achievements: ''
  });
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePrompt = (data: typeof formData) => {
    return `Write a LinkedIn summary with these details:

Name: ${data.name}
Current Role: ${data.jobTitle}
Industry: ${data.industry}
Experience: ${data.experience}
Skills: ${data.skills}
Career Goals: ${data.careerGoals}
Achievements: ${data.achievements}

Requirements:
1. Start directly with the summary content - no introductions or explanations
2. Write in first person
3. Make it engaging and professional
4. Include achievements and skills naturally in the text
5. Keep it under 2000 characters
6. Use proper paragraphing and bullet points where appropriate
7. Do not add any hashtags at the end
8. Do not include any meta text or explanations about the summary`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey) {
      setError('Please add your Gemini API key in the Dashboard settings before generating content.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
      const prompt = generatePrompt(formData);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setGeneratedSummary(text);
    } catch (err) {
      setError('Failed to generate summary. Please check your API key and try again.');
      console.error('Error generating summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestData = () => {
    setFormData({
      name: "Alex Thompson",
      jobTitle: "Senior Software Engineer",
      industry: "Technology & Software Development",
      experience: "8+ years of experience in full-stack development, leading teams of 5-10 developers, and delivering enterprise-scale applications. Specialized in cloud architecture and microservices. Previously worked at Microsoft and two successful startups.",
      skills: "Full-stack development (React, Node.js, Python), Cloud Architecture (AWS, Azure), Team Leadership, Agile Project Management, System Design, Performance Optimization",
      careerGoals: "Seeking to transition into a Technical Architecture role where I can leverage my development experience to design scalable systems and mentor junior developers.",
      achievements: "- Led the development of a microservices platform that reduced deployment time by 70%\n- Awarded 'Innovation Champion 2024' at current company\n- Published 3 technical articles on Medium with 50k+ views"
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">LinkedIn Summary Generator</h1>
          <p className="text-gray-600">Create a compelling LinkedIn summary using AI</p>
        </div>
        <Button
          onClick={fillTestData}
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800"
        >
          Fill Test Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
            required
          />
          <Input
            label="Job Title / Student Status"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="e.g., Software Engineer or Computer Science Student"
            required
          />
          <Input
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="e.g., Technology, Education, Finance"
            required
          />
          <TextArea
            label="Experience"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            placeholder="Briefly describe your relevant experience"
            rows={3}
            required
          />
          <TextArea
            label="Skills"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="List your key skills"
            rows={3}
            required
          />
          <TextArea
            label="Career Goals"
            value={formData.careerGoals}
            onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
            placeholder="What are your career aspirations?"
            rows={3}
            required
          />
          <TextArea
            label="Achievements (Optional)"
            value={formData.achievements}
            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
            placeholder="List any notable achievements"
            rows={3}
          />
          <Button type="submit" isFullWidth>
            Generate Summary
          </Button>
        </form>

        {/* Preview Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Generated Summary Preview</h2>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          {generatedSummary && !isLoading && (
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg overflow-auto max-h-[600px] linkedin-preview">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>
                  {generatedSummary}
                </div>
              </div>
              <style jsx global>{`
                .linkedin-preview {
                  font-size: 16px;
                  line-height: 1.6;
                }
                .linkedin-preview p {
                  margin-bottom: 1rem;
                }
                .linkedin-preview ul {
                  list-style-type: disc;
                  margin-left: 1.5rem;
                  margin-bottom: 1rem;
                }
                .linkedin-preview li {
                  margin-bottom: 0.5rem;
                }
              `}</style>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedSummary)}
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  Copy Text
                </Button>
                <Button
                  onClick={() => {
                    const previewWindow = window.open('', '_blank');
                    if (previewWindow) {
                      previewWindow.document.write(`
                        <html>
                          <head>
                            <title>LinkedIn Summary Preview</title>
                            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
                            <style>
                              body {
                                background-color: #ffffff;
                                color: #24292e;
                              }
                              .markdown-body {
                                box-sizing: border-box;
                                min-width: 200px;
                                max-width: 980px;
                                margin: 0 auto;
                                padding: 45px;
                                background-color: #ffffff;
                                color: #24292e;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                                line-height: 1.6;
                              }
                              .markdown-body * {
                                color: inherit;
                              }
                              .markdown-body p {
                                margin-bottom: 16px;
                              }
                              .markdown-body ul {
                                margin-bottom: 16px;
                                padding-left: 2em;
                              }
                              .markdown-body li {
                                margin: 0.25em 0;
                              }
                              @media (max-width: 767px) {
                                .markdown-body {
                                  padding: 15px;
                                }
                              }
                            </style>
                          </head>
                          <body class="markdown-body">
                            <div id="content"></div>
                            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
                            <script>
                              document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(generatedSummary)});
                            </script>
                          </body>
                        </html>
                      `);
                    }
                  }}
                  type="button"
                >
                  Preview in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInSummary;