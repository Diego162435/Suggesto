export const generateAmazonLink = (title: string, type: 'movie' | 'tv' | 'book' | 'product', customTerm?: string): string => {
    // Affiliate Tag (Replace with user's actual tag later)
    const AFFILIATE_TAG = 'suggesto-20';

    // Base Search URL
    const BASE_URL = 'https://www.amazon.com.br/s';

    // Determine category index
    let categoryIndex = 'aps'; // 'All Departments' as fallback

    switch (type) {
        case 'movie':
            // Amazon Video or DVD/Blu-ray
            categoryIndex = 'dvd';
            break;
        case 'tv':
            categoryIndex = 'dvd'; // Usually handled same as movies for physical, or instant-video
            break;
        case 'book':
            categoryIndex = 'books';
            break;
        case 'product':
            categoryIndex = 'aps'; // General
            break;
    }

    const searchTerm = customTerm || title;

    // Construct URL parameters
    const params = new URLSearchParams({
        k: searchTerm,
        i: categoryIndex,
        tag: AFFILIATE_TAG,
        linkCode: 'ur2',
        linkId: 'default' // Placeholder
    });

    return `${BASE_URL}?${params.toString()}`;
}
