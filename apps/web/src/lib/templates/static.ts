import type JSZip from "jszip";
import type { TechStackItemType } from "@blueprint/shared/types";
import { TEMPLATE_CSS_COLORS, TEMPLATE_CSS_VALUES } from "@blueprint/shared";
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
  const C = TEMPLATE_CSS_COLORS;
  const V = TEMPLATE_CSS_VALUES;

  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: ${C.BODY_TEXT};
}

.container {
    max-width: ${V.CONTAINER_MAX_WIDTH_PX}px;
    margin: 0 auto;
    padding: 0 ${V.CONTAINER_PADDING_X_PX}px;
}

header {
    background: ${C.HEADER_BG};
    box-shadow: 0 ${V.HEADER_SHADOW_Y_PX}px ${V.HEADER_SHADOW_BLUR_PX}px rgba(0,0,0,${V.HEADER_SHADOW_OPACITY});
    position: sticky;
    top: 0;
    z-index: ${V.HEADER_Z_INDEX};
}

nav h1 {
    padding: 1rem 0;
    color: ${C.ACCENT_BLUE};
    font-size: ${V.NAV_H1_FONT_SIZE_REM}rem;
}

.hero {
    background: linear-gradient(135deg, ${C.HERO_GRADIENT_START} 0%, ${C.HERO_GRADIENT_END} 100%);
    color: ${C.HERO_TEXT};
    padding: ${V.SECTION_PADDING_Y_REM}rem 0;
    text-align: center;
}

.hero h2 {
    font-size: ${V.HERO_H2_FONT_SIZE_REM}rem;
    margin-bottom: ${V.HEADING_MARGIN_BOTTOM_REM}rem;
}

.hero p {
    font-size: ${V.HERO_P_FONT_SIZE_REM}rem;
    opacity: ${V.HERO_P_OPACITY};
}

.features {
    padding: ${V.SECTION_PADDING_Y_REM}rem 0;
    background: ${C.FEATURES_BG};
}

.features h3 {
    text-align: center;
    font-size: ${V.SECTION_H3_FONT_SIZE_REM}rem;
    margin-bottom: ${V.SECTION_HEADING_MARGIN_BOTTOM_REM}rem;
    color: ${C.SECTION_HEADING};
}

.feature-grid {
    display: grid;
    grid-template-columns: ${V.GRID_TEMPLATE_COLUMNS};
    gap: ${V.GRID_GAP_REM}rem;
}

.feature-card {
    background: ${C.CARD_BG};
    padding: ${V.CARD_PADDING_REM}rem;
    border-radius: ${V.CARD_BORDER_RADIUS_PX}px;
    box-shadow: ${V.CARD_SHADOW_X_PX} ${V.CARD_SHADOW_Y_PX}px ${V.CARD_SHADOW_BLUR_PX}px rgba(0,0,0,${V.CARD_SHADOW_OPACITY});
    transition: transform ${V.CARD_HOVER_TRANSITION_S}s;
}

.feature-card:hover {
    transform: translateY(${V.CARD_HOVER_TRANSLATE_Y_PX}px);
}

.feature-card h4 {
    color: ${C.ACCENT_BLUE};
    margin-bottom: ${V.CARD_TITLE_MARGIN_BOTTOM_REM}rem;
    font-size: ${V.CARD_TITLE_FONT_SIZE_REM}rem;
}

.feature-card p {
    color: ${C.CARD_TEXT};
}

footer {
    background: ${C.FOOTER_BG};
    color: ${C.HERO_TEXT};
    text-align: center;
    padding: ${V.FOOTER_PADDING_Y_REM}rem 0;
}

@media (max-width: ${V.MOBILE_BREAKPOINT_PX}px) {
    .hero h2 {
        font-size: ${V.HERO_MOBILE_H2_FONT_SIZE_REM}rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}`;
}

export function generateStaticJS(features: string[]): string {
  const V = TEMPLATE_CSS_VALUES;
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
        threshold: ${V.INTERSECTION_THRESHOLD},
        rootMargin: '0px 0px ${V.INTERSECTION_ROOT_MARGIN_PX}px 0px'
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
        card.style.transform = 'translateY(${V.SCROLL_INITIAL_OFFSET_PX}px)';
        card.style.transition = 'opacity ${V.SCROLL_ANIMATION_DURATION_S}s ease, transform ${V.SCROLL_ANIMATION_DURATION_S}s ease';
        observer.observe(card);
    });
});
`;
}
