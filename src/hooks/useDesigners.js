import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useDesigners = () => {
    const [designers, setDesigners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDesigners = async () => {
            try {
                setLoading(true);

                // 1. Fetch Designers with their Projects and Images
                // We use a "Deep Select" to get everything in one request
                const { data, error } = await supabase
                    .from('designers')
                    .select(`
            *,
            designer_projects (
              project_category,
              project_images ( image_url, is_cover )
            )
          `)
                    .eq('status', 'approved'); // Only show approved designers

                if (error) throw error;

                // 2. TRANSFORM the data to match MOCK_DESIGNERS format
                const formattedData = data.map(d => {

                    // Flatten portfolio: Convert array of projects into { kitchen: url, living: url }
                    const portfolioMap = {};
                    let coverImage = '/background.jpg'; // Default fallback

                    if (d.designer_projects) {
                        d.designer_projects.forEach(project => {
                            const cat = project.project_category.toLowerCase(); // e.g., 'kitchen'

                            // Get the first image of this project
                            const img = project.project_images?.[0]?.image_url;

                            if (img) {
                                portfolioMap[cat] = img;
                                // If this project is marked as cover, use it
                                if (project.project_images.find(i => i.is_cover)) {
                                    coverImage = img;
                                }
                            }
                        });
                    }

                    // If no specific cover found, use the first available image
                    if (coverImage === '/background.jpg' && Object.values(portfolioMap).length > 0) {
                        coverImage = Object.values(portfolioMap)[0];
                    }

                    return {
                        id: d.id,
                        name: d.name,
                        city: d.city,
                        rating: 5.0, // Hardcoded for now (Reviews table is separate)
                        reviews: 0,
                        experience: `${d.experience_years || 0} Yrs`,
                        priceRange: d.budget_range?.replace(/\$/g, '₹') || '₹₹', // Convert $ to ₹
                        isVerified: d.is_verified,
                        tags: d.style_tags || [],
                        about: d.bio,
                        portfolio: {
                            cover: coverImage,
                            ...portfolioMap // Spreads kitchen: url, living: url, etc.
                        }
                    };
                });

                setDesigners(formattedData);
            } catch (err) {
                console.error("Error fetching designers:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDesigners();
    }, []);

    return { designers, loading, error };
};