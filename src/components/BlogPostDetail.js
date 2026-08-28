import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaClock, FaTag, FaShareAlt, FaCheck, FaUser } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet-async';

const fallbackBlogPosts = {
    'architecting-scalable-web-apps': {
        id: 'architecting-scalable-web-apps',
        title: 'Architecting Scalable Web Applications with React & Modern Frontend Patterns',
        description: 'A deep dive into state management, clean architecture, performance optimization, and modular code structures that scale effortlessly.',
        fullDesc: `### Introduction

Building modern web applications requires balancing performance, developer experience, and scalability. In this article, we explore architectural patterns that have proven effective across production applications.

#### Key Architectural Pillars

1. **State Management Decoupling**: Keeping UI components presentation-focused while moving business logic to hooks or state containers.
2. **Code Splitting & Lazy Loading**: Dynamic imports reduce initial bundle size and speed up Largest Contentful Paint (LCP).
3. **Design Token Systems**: Utilizing CSS custom properties and standardized color tokens for maintainable theme switching.

\`\`\`javascript
// Example: Custom Reactive Hook Pattern
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}
\`\`\`

#### Component Composition over Prop Drilling

When developing deeply nested UI component trees, relying heavily on prop drilling creates brittle abstractions. Combining React Context for global app preferences with composition slots for presentation layouts yields clean, readable components.

#### Performance & Optimization Best Practices

- Memoize computationally heavy algorithms using \`useMemo\`.
- Keep render loops lightweight by avoiding inline anonymous arrow functions in hot list items.
- Monitor Core Web Vitals (INP, LCP, CLS) in production environments.

#### Conclusion

By enforcing modular boundaries and leveraging React 18+ capabilities, we build applications that remain fast, responsive, and robust as team sizes and user bases grow.`,
        tags: ['Tech', 'React', 'Architecture', 'Web Dev'],
        date: '2026-08-15',
        readTime: '5 min read',
        author: 'Arpit Pardesi',
        color: '#6366f1',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    },
    'building-autonomous-ai-agents': {
        id: 'building-autonomous-ai-agents',
        title: 'Building Autonomous AI Agents: From Prompting to Tool Orchestration',
        description: 'Exploring LLM tool calling, multi-agent coordination, stateful execution loops, and robust error recovery mechanisms.',
        fullDesc: `### The Shift to Autonomous AI Agents

Artificial Intelligence is shifting rapidly from single-turn chat interfaces to goal-directed autonomous agents capable of using tools and modifying system state.

#### Core Components of Agentic Systems

- **Task Planning & Decomposition**: Breaking complex goals into sub-tasks.
- **Tool Access (MCP & APIs)**: Giving agents programmatic access to web search, filesystems, and databases.
- **Memory Systems**: Short-term context management paired with vector databases for long-term retrieval.

\`\`\`python
# Agentic Tool Invocation Loop Pattern
async def run_agent_loop(agent, initial_prompt):
    messages = [{"role": "user", "content": initial_prompt}]
    while True:
        response = await agent.generate(messages)
        if not response.tool_calls:
            return response.text
        
        for tool_call in response.tool_calls:
            result = await execute_tool(tool_call)
            messages.append({"role": "tool", "content": result})
\`\`\`

#### Multi-Agent Orchestration & Communication

When tasks require specialization (e.g. one agent for code generation, another for automated browser testing, and a third for accessibility auditing), structured communication protocols allow sub-agents to collaborate seamlessly.

#### Security & Boundaries

Executing LLM-generated tool calls requires strict sandboxing, path restrictions, and confirmation steps for high-risk operations.

#### Looking Ahead

As tool execution becomes safer and context windows grow, agentic software development will transform how developers build tools.`,
        tags: ['AI', 'Tech', 'Python', 'Agents'],
        date: '2026-08-01',
        readTime: '6 min read',
        author: 'Arpit Pardesi',
        color: '#8b5cf6',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    },
    'hardware-to-cloud-esp32-iot': {
        id: 'hardware-to-cloud-esp32-iot',
        title: 'Hardware to Cloud: Building Smart Home Automation with ESP32 & MQTT',
        description: 'Step-by-step guide to custom IoT sensor nodes, edge processing, Home Assistant integration, and real-time telemetry streaming.',
        fullDesc: `### Bringing Hardware to Life

Combining low-cost microcontrollers like the ESP32 with open protocols like MQTT opens up endless possibilities for custom home automation and sensor networks.

#### System Architecture

1. **Edge Node (ESP32)**: Captures temperature, humidity, and motion events using sensor interrupts.
2. **Message Broker (Mosquitto MQTT)**: Low-latency pub/sub messaging framework over local Wi-Fi.
3. **Automation Core (Home Assistant)**: Collects metrics and triggers real-time alerts.

#### Deep Dive: Edge Reliability

Embedded devices operate in noisy physical environments where Wi-Fi reconnects and power fluctuations occur. Implementing automatic exponential backoff reconnection loops on the ESP32 ensures self-healing connectivity.

#### Summary

Edge computing with microcontrollers allows building privacy-first smart home systems that don't rely on third-party cloud vendor APIs.`,
        tags: ['IoT', 'Tech', 'Embedded', 'Hardware'],
        date: '2026-07-20',
        readTime: '4 min read',
        author: 'Arpit Pardesi',
        color: '#0ea5e9',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
    },
    'crafting-portfolio-dark-mode-glassmorphism': {
        id: 'crafting-portfolio-dark-mode-glassmorphism',
        title: 'Crafting a Modern Portfolio: Glassmorphism, Micro-Animations & Dark Mode Aesthetics',
        description: 'Reflections on designing intuitive developer portfolios with dynamic theme systems, Matter.js interactive physics, and high visual polish.',
        fullDesc: `### Design Philosophy & Aesthetic Details

Your portfolio is often the first impression a potential user or team has of your work. Combining functional utility with visual delight creates an engaging experience.

#### Principles Applied

- **Glassmorphism**: Subtle translucent backgrounds (\`backdrop-filter: blur(10px)\`) paired with crisp borders.
- **Dynamic Accent Colors**: Allowing site-wide accent theme shifting using CSS custom variables.
- **Interactive Micro-Animations**: Spring physics with Framer Motion for responsive hover states.

#### Lessons Learned

Aesthetics should enhance readability, not obscure it. Ensuring contrast ratios and smooth 60fps transitions makes interactive web apps feel fast and premium.`,
        tags: ['Web Dev', 'Design', 'Life', 'React'],
        date: '2026-07-05',
        readTime: '3 min read',
        author: 'Arpit Pardesi',
        color: '#f43f5e',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    }
};

const BlogPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                // Try Firestore document by ID
                const docRef = doc(db, 'blogs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPost({
                        id: docSnap.id,
                        title: data.title,
                        description: data.description || data.desc || '',
                        fullDesc: data.fullDesc || data.content || data.description || '',
                        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : ['General']),
                        date: data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '2026-08-28'),
                        readTime: data.readTime || `${Math.max(1, Math.ceil((data.fullDesc || '').split(' ').length / 200))} min read`,
                        author: data.author || 'Arpit Pardesi',
                        color: data.color || '#6366f1',
                        image: data.image || (data.mediaItems && data.mediaItems[0]?.url) || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'
                    });
                } else if (fallbackBlogPosts[id]) {
                    setPost(fallbackBlogPosts[id]);
                } else {
                    // Fallback to first available item if not found
                    setPost(fallbackBlogPosts['architecting-scalable-web-apps']);
                }
            } catch (err) {
                console.error("Error loading blog post:", err);
                if (fallbackBlogPosts[id]) {
                    setPost(fallbackBlogPosts[id]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Loading article...
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <h2>Article Not Found</h2>
                <button onClick={() => navigate('/blog')} className="back-link">
                    <FaArrowLeft /> Return to Blog
                </button>
            </div>
        );
    }

    return (
        <article className="blog-post-detail" style={{
            padding: 'calc(120px + env(safe-area-inset-top)) 20px 100px',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1
        }}>
            <Helmet>
                <title>{`${post.title} | Arpit Pardesi Blog`}</title>
                <meta name="description" content={post.description} />
            </Helmet>

            {/* Back Navigation */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'fixed', top: 'calc(100px + env(safe-area-inset-top))', left: '40px', zIndex: 100 }}
                className="back-nav"
            >
                <button onClick={() => navigate('/blog')} className="back-link">
                    <FaArrowLeft /> All Articles
                </button>
            </motion.div>

            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                {/* Post Header Header Container */}
                <motion.header
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    style={{ marginBottom: '2.5rem' }}
                >
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                        {post.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(var(--accent-rgb), 0.15)',
                                color: 'var(--accent-color)',
                                border: '1px solid rgba(var(--accent-rgb), 0.3)'
                            }}>
                                <FaTag size={10} style={{ marginRight: '6px' }} />
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Main Title */}
                    <h1 style={{
                        fontSize: '2.6rem',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        lineHeight: '1.25',
                        marginBottom: '1.2rem'
                    }}>
                        {post.title}
                    </h1>

                    {/* Metadata Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                }}>
                                    <FaUser size={12} />
                                </div>
                                {post.author}
                            </div>
                            <span>•</span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaClock size={12} /> {post.readTime}
                            </span>
                        </div>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-color)',
                                color: copied ? '#10b981' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {copied ? <FaCheck /> : <FaShareAlt />}
                            {copied ? 'Link Copied!' : 'Share'}
                        </button>
                    </div>
                </motion.header>

                {/* Banner / Cover Image */}
                {post.image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            width: '100%',
                            height: '380px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            marginBottom: '3rem',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
                        }}
                    >
                        <img
                            src={post.image}
                            alt={post.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </motion.div>
                )}

                {/* Markdown Post Body */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="markdown-content"
                    style={{
                        color: 'var(--text-primary)',
                        fontSize: '1.1rem',
                        lineHeight: '1.8'
                    }}
                >
                    <ReactMarkdown>{post.fullDesc || post.description}</ReactMarkdown>
                </motion.div>

                {/* Footer Navigation Back */}
                <div style={{
                    marginTop: '4rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button onClick={() => navigate('/blog')} className="back-link">
                        <FaArrowLeft /> Back to All Articles
                    </button>
                </div>
            </div>

            <style>
                {`
                    .markdown-content h1,
                    .markdown-content h2,
                    .markdown-content h3,
                    .markdown-content h4 {
                        color: var(--text-primary);
                        font-weight: 700;
                        margin-top: 2rem;
                        margin-bottom: 1rem;
                        line-height: 1.3;
                    }
                    .markdown-content h1 { font-size: 2.2rem; }
                    .markdown-content h2 { font-size: 1.8rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
                    .markdown-content h3 { font-size: 1.4rem; color: var(--accent-color); }
                    .markdown-content h4 { font-size: 1.2rem; }

                    .markdown-content p {
                        margin-bottom: 1.5rem;
                        color: rgba(255, 255, 255, 0.85);
                    }

                    .markdown-content ul,
                    .markdown-content ol {
                        margin-bottom: 1.5rem;
                        padding-left: 1.8rem;
                        color: rgba(255, 255, 255, 0.85);
                    }

                    .markdown-content li {
                        margin-bottom: 0.5rem;
                    }

                    .markdown-content blockquote {
                        border-left: 4px solid var(--accent-color);
                        padding: 1rem 1.5rem;
                        margin: 1.8rem 0;
                        background: rgba(var(--accent-rgb), 0.08);
                        border-radius: 0 12px 12px 0;
                        font-style: italic;
                        color: var(--text-primary);
                    }

                    .markdown-content code {
                        background: rgba(255, 255, 255, 0.08);
                        color: var(--accent-color);
                        padding: 3px 8px;
                        border-radius: 6px;
                        font-family: var(--font-mono, monospace);
                        font-size: 0.9em;
                    }

                    .markdown-content pre {
                        background: #0d0d12;
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        padding: 1.5rem;
                        border-radius: 14px;
                        overflow-x: auto;
                        margin: 1.8rem 0;
                    }

                    .markdown-content pre code {
                        background: transparent;
                        color: #e2e8f0;
                        padding: 0;
                    }

                    @media (max-width: 768px) {
                        .blog-post-detail {
                            padding: calc(100px + env(safe-area-inset-top)) 16px 60px !important;
                        }
                        .blog-post-detail h1 {
                            font-size: 2rem !important;
                        }
                        .back-nav {
                            position: static !important;
                            margin-bottom: 2rem;
                            display: inline-block;
                            align-self: flex-start;
                        }
                    }
                    .back-link {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: var(--text-secondary);
                        text-decoration: none;
                        font-size: 1rem;
                        font-weight: 500;
                        padding: 8px 16px;
                        border-radius: 50px;
                        background: rgba(10, 10, 10, 0.5);
                        backdrop-filter: blur(5px);
                        border: 1px solid var(--border-color);
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }
                    .back-link:hover {
                        background: rgba(var(--accent-rgb), 0.1);
                        border-color: var(--accent-color);
                        color: var(--accent-color);
                        transform: translateX(-4px);
                    }
                `}
            </style>
        </article>
    );
};

export default BlogPostDetail;
