import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/AuthContext';
import { useApiKey } from '../lib/ApiKeyContext';

const GitHubProfile = () => {
  const { user } = useAuth();
  const { geminiKey } = useApiKey();
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

IGNORE LICENSES
Please format it as a professional README.md with markdown,  including appropriate emojis, badges, and sections. Make it visually appealing and professional. DONT INCLUDE ANY SUGGESTIONS OR IMPROVEMENTS`;
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = generatePrompt(formData);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Remove markdown code block indicators if present
      const cleanedText = text.replace(/^```markdown\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
      
      setGeneratedProfile(cleanedText);
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
            <div className="prose prose-github max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg overflow-auto max-h-[600px] markdown-preview">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold border-b pb-2 mb-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-4" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                    img: ({ node, ...props }) => <img className="max-w-full rounded-md my-4" {...props} />,
                    code: ({ node, inline, ...props }) => 
                      inline ? (
                        <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props} />
                      ) : (
                        <code className="block bg-gray-100 rounded p-4 overflow-x-auto text-sm" {...props} />
                      )
                  }}
                >
                  {generatedProfile}
                </ReactMarkdown>
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedProfile)}
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800"
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
                              }
                              .markdown-body * {
                                color: inherit;
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
                              document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(generatedProfile)});
                            </script>
                          </body>
                        </html>
                      `);
                    }
                  }}
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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