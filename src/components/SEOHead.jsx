import { useEffect } from 'react';

export default function SEOHead({ 
  title, 
  description, 
  ogTitle, 
  ogDescription, 
  ogImage = 'https://7percent.info/og-image.jpg',
  ogUrl = 'https://7percent.info'
}) {
  useEffect(() => {
    // Set title
    document.title = title;

    // Remove existing meta tags we're about to set
    const metaTags = document.querySelectorAll('meta[name="description"], meta[property^="og:"]');
    metaTags.forEach(tag => tag.remove());

    // Meta description
    const descMeta = document.createElement('meta');
    descMeta.name = 'description';
    descMeta.content = description;
    document.head.appendChild(descMeta);

    // Open Graph tags
    const ogTitleMeta = document.createElement('meta');
    ogTitleMeta.property = 'og:title';
    ogTitleMeta.content = ogTitle || title;
    document.head.appendChild(ogTitleMeta);

    const ogDescMeta = document.createElement('meta');
    ogDescMeta.property = 'og:description';
    ogDescMeta.content = ogDescription || description;
    document.head.appendChild(ogDescMeta);

    const ogTypeMeta = document.createElement('meta');
    ogTypeMeta.property = 'og:type';
    ogTypeMeta.content = 'website';
    document.head.appendChild(ogTypeMeta);

    const ogUrlMeta = document.createElement('meta');
    ogUrlMeta.property = 'og:url';
    ogUrlMeta.content = ogUrl;
    document.head.appendChild(ogUrlMeta);

    const ogImageMeta = document.createElement('meta');
    ogImageMeta.property = 'og:image';
    ogImageMeta.content = ogImage;
    document.head.appendChild(ogImageMeta);

    // Robots tag
    const robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    robotsMeta.content = 'index, follow';
    document.head.appendChild(robotsMeta);

    // Viewport (should already exist but ensure it's there)
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(viewportMeta);
    }

    // Cleanup is handled by removing old tags at start
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl]);

  return null;
}