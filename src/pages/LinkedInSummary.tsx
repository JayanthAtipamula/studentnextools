import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const LinkedInSummary = () => {
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
    return `Create a compelling and professional LinkedIn summary for the following person:

Name: ${data.name}
Current Role: ${data.jobTitle}
Industry: ${data.industry}
Experience: ${data.experience}
Skills: ${data.skills}
Career Goals: ${data.careerGoals}
Achievements: ${data.achievements}

Please write a well-structured, engaging summary that:
1. Hooks the reader in the first line
2. Highlights their expertise and experience
3. Showcases their skills and achievements
4. Reflects their career aspirations
5. Maintains a professional yet personable tone
6. Is optimized for LinkedIn's format (2000 characters max)
7. Includes appropriate keywords for their industry

Format the summary in a way that's easy to read with proper paragraphing.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                <ReactMarkdown>{generatedSummary}</ReactMarkdown>
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedSummary)}
                  type="button"
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
                              .markdown-body {
                                box-sizing: border-box;
                                min-width: 200px;
                                max-width: 980px;
                                margin: 0 auto;
                                padding: 45px;
                              }
                            </style>
                          </head>
                          <body class="markdown-body">
                            ${new ReactMarkdown().render(generatedSummary)}
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