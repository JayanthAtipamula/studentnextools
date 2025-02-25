import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const GitHubProfile = () => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    programmingSkills: '',
    frontendSkills: '',
    backendSkills: '',
    databaseSkills: '',
    softwareSkills: '',
    work: '',
    projects: '',
    githubLink: '',
    leetcodeLink: ''
  });
  const [generatedProfile, setGeneratedProfile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePrompt = (data: typeof formData) => {
    return `Create a professional GitHub profile README.md with the following information:

Title: ${data.title}
Subtitle: ${data.subtitle}

Skills:
- Programming Languages: ${data.programmingSkills}
- Frontend: ${data.frontendSkills}
- Backend: ${data.backendSkills}
- Databases: ${data.databaseSkills}
- Software & Tools: ${data.softwareSkills}

Work Experience:
${data.work}

Projects:
${data.projects}

Social Links:
- GitHub: ${data.githubLink}
- LeetCode: ${data.leetcodeLink}

Please format it beautifully with markdown, including appropriate emojis, badges, and sections. Make it visually appealing and professional.`;
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
      
      setGeneratedProfile(text);
    } catch (err) {
      setError('Failed to generate profile. Please check your API key and try again.');
      console.error('Error generating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestData = () => {
    setFormData({
      title: "Hi 👋, I'm Sarah Johnson",
      subtitle: "A passionate Full Stack Developer from San Francisco",
      programmingSkills: "Python, JavaScript, TypeScript, Java, C++",
      frontendSkills: "React, Next.js, Vue.js, TailwindCSS, Material-UI",
      backendSkills: "Node.js, Express, Django, FastAPI, Spring Boot",
      databaseSkills: "PostgreSQL, MongoDB, Redis, Elasticsearch",
      softwareSkills: "Git, Docker, AWS, Kubernetes, CI/CD",
      work: "- Senior Full Stack Developer at TechCorp (2021-Present)\n- Software Engineer at StartupX (2019-2021)\n- Junior Developer at CodeCo (2018-2019)",
      projects: "- BuildMaster: A CI/CD platform with 1000+ active users\n- DataViz: Real-time data visualization dashboard\n- SmartChat: AI-powered customer service chatbot",
      githubLink: "https://github.com/sarahjohnson",
      leetcodeLink: "https://leetcode.com/sarahjohnson"
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GitHub Profile Maker</h1>
          <p className="text-gray-600">Create an impressive GitHub profile README using AI</p>
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
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Hi 👋, I'm John Doe"
            required
          />
          <Input
            label="Subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g., A passionate full-stack developer from Canada"
            required
          />
          
          <div className="border-t border-gray-200 my-6 pt-6">
            <h2 className="text-lg font-semibold mb-4">Skills</h2>
            <TextArea
              label="Programming Languages"
              value={formData.programmingSkills}
              onChange={(e) => setFormData({ ...formData, programmingSkills: e.target.value })}
              placeholder="e.g., Python, JavaScript, Java"
              rows={2}
              required
            />
            <TextArea
              label="Frontend Skills"
              value={formData.frontendSkills}
              onChange={(e) => setFormData({ ...formData, frontendSkills: e.target.value })}
              placeholder="e.g., React, Vue.js, CSS"
              rows={2}
              required
            />
            <TextArea
              label="Backend Skills"
              value={formData.backendSkills}
              onChange={(e) => setFormData({ ...formData, backendSkills: e.target.value })}
              placeholder="e.g., Node.js, Django, Express"
              rows={2}
              required
            />
            <TextArea
              label="Database Skills"
              value={formData.databaseSkills}
              onChange={(e) => setFormData({ ...formData, databaseSkills: e.target.value })}
              placeholder="e.g., PostgreSQL, MongoDB, Redis"
              rows={2}
              required
            />
            <TextArea
              label="Software & Tools"
              value={formData.softwareSkills}
              onChange={(e) => setFormData({ ...formData, softwareSkills: e.target.value })}
              placeholder="e.g., Git, Docker, AWS"
              rows={2}
              required
            />
          </div>

          <div className="border-t border-gray-200 my-6 pt-6">
            <h2 className="text-lg font-semibold mb-4">Experience & Projects</h2>
            <TextArea
              label="Work Experience"
              value={formData.work}
              onChange={(e) => setFormData({ ...formData, work: e.target.value })}
              placeholder="List your work experience"
              rows={4}
              required
            />
            <TextArea
              label="Projects"
              value={formData.projects}
              onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
              placeholder="List your notable projects"
              rows={4}
              required
            />
          </div>

          <div className="border-t border-gray-200 my-6 pt-6">
            <h2 className="text-lg font-semibold mb-4">Social Links</h2>
            <Input
              label="GitHub Profile URL"
              value={formData.githubLink}
              onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
              placeholder="https://github.com/username"
              type="url"
              required
            />
            <Input
              label="LeetCode Profile URL"
              value={formData.leetcodeLink}
              onChange={(e) => setFormData({ ...formData, leetcodeLink: e.target.value })}
              placeholder="https://leetcode.com/username"
              type="url"
              required
            />
          </div>

          <Button type="submit" isFullWidth>
            Generate Profile README
          </Button>
        </form>

        {/* Preview Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Generated Profile Preview</h2>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          {generatedProfile && !isLoading && (
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                <ReactMarkdown>{generatedProfile}</ReactMarkdown>
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedProfile)}
                  type="button"
                >
                  Copy Markdown
                </Button>
                <Button
                  onClick={() => {
                    const previewWindow = window.open('', '_blank');
                    if (previewWindow) {
                      previewWindow.document.write(`
                        <html>
                          <head>
                            <title>GitHub Profile Preview</title>
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
                            ${new ReactMarkdown().render(generatedProfile)}
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

export default GitHubProfile;