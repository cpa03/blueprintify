import type JSZip from "jszip";
import type { TechStackItemType } from "@blueprint/shared";
import { generateProjectReadme } from "./shared";

export async function generateStaticProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  _techStack: TechStackItemType[]
): Promise<void> {
  void _techStack;
  zip.file("index.html", generateStaticHTML(projectName, description, features));
  zip.file("style.css", generateStaticCSS());
  zip.file("script.js", generateStaticJS(features));

  zip.file("README.md", generateProjectReadme(projectName, description, features, "Static Site"));
}

export function generateStaticHTML(
  projectName: string,
  description: string,
  features: string[]
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <div class="container">
                <h1>${projectName}</h1>
            </div>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h2>${description}</h2>
                <p>A modern web application built with best practices.</p>
            </div>
        </section>

        <section class="features">
            <div class="container">
                <h3>Features</h3>
                <div class="feature-grid">
                    ${features
                      .map(
                        (feature) => `<div class="feature-card">
                        <h4>${feature}</h4>
                        <p>Implementation of ${feature} functionality.</p>
                    </div>`
                      )
                      .join("")}
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
}

export function generateStaticCSS(): string {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

header {
    background: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

nav h1 {
    padding: 1rem 0;
    color: #2563eb;
    font-size: 1.5rem;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.hero h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.features {
    padding: 4rem 0;
    background: #f8fafc;
}

.features h3 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 3rem;
    color: #1e293b;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-card h4 {
    color: #2563eb;
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.feature-card p {
    color: #64748b;
}

footer {
    background: #1e293b;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

@media (max-width: 768px) {
    .hero h2 {
        font-size: 2rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}`;
}

export function generateStaticJS(features: string[]): string {
  return `document.addEventListener('DOMContentLoaded', function() {
    console.log('${features.length > 0 ? features[0] : "Project"} loaded successfully!');
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});
`;
}
