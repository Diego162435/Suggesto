import { Helmet } from 'react-helmet-async';
import { MediaItem } from '../types/media';

interface SeoHeadProps {
    title: string;
    description?: string;
    image?: string;
    type: 'movie' | 'tv' | 'book' | 'product';
    item?: MediaItem; // Optional: detailed item data for Schema
}

export function SeoHead({ title, description, image, type, item }: SeoHeadProps) {
    const siteName = "Sugesto";
    const fullTitle = `${title} | ${siteName} - Onde Assistir e Comprar`;
    const metaDescription = description || `Descubra onde assistir ou comprar ${title}. Veja avaliações, sinopse e sugestões relacionadas no ${siteName}.`;
    const currentUrl = window.location.href;

    // Generate Schema.org JSON-LD
    let schemaData: any = null;

    if (item && (type === 'movie' || type === 'tv')) {
        schemaData = {
            "@context": "https://schema.org",
            "@type": type === 'movie' ? "Movie" : "TVSeries",
            "name": item.title,
            "description": item.overview || metaDescription,
            "image": image,
            "datePublished": item.releaseDate,
            "aggregateRating": item.voteAverage ? {
                "@type": "AggregateRating",
                "ratingValue": item.voteAverage,
                "bestRating": "10",
                "worstRating": "1",
                "ratingCount": item.voteCount || 100 // Fallback if count missing
            } : undefined,
            "director": item.director ? {
                "@type": "Person",
                "name": item.director
            } : undefined
        };
    } else if (item && type === 'book') {
        schemaData = {
            "@context": "https://schema.org",
            "@type": "Book",
            "name": item.title,
            "author": item.author ? {
                "@type": "Person",
                "name": item.author
            } : undefined,
            "bookFormat": "https://schema.org/Paperback",
            "description": item.overview || metaDescription,
            "image": image,
        };
    }

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type === 'book' ? 'book' : 'video.movie'} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            {image && <meta name="twitter:image" content={image} />}

            {/* Schema.org JSON-LD */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}
        </Helmet>
    );
}
