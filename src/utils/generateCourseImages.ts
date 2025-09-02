import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CourseImageData {
  title: string;
  fileName: string;
  prompt: string;
}

export const courseImagePrompts: CourseImageData[] = [
  {
    title: "SBA 7(a) Loans",
    fileName: "course-sba-7a.jpg",
    prompt: "Professional corporate finance visualization showing SBA government building with loan documents and business growth charts, clean modern design, blue and gold color scheme, no people, ultra high resolution"
  },
  {
    title: "SBA Express Loans",
    fileName: "course-sba-express.jpg", 
    prompt: "High-speed business finance concept with express loan documents, fast approval stamps, and growth arrows, sleek modern aesthetic, blue and silver tones, no people, ultra high resolution"
  },
  {
    title: "Commercial Real Estate",
    fileName: "course-commercial-real-estate.jpg",
    prompt: "Modern commercial buildings with financial charts and property investment documents, professional real estate finance imagery, steel blue and gold colors, no people, ultra high resolution"
  },
  {
    title: "Equipment Financing",
    fileName: "course-equipment-financing.jpg",
    prompt: "Business equipment and machinery with financial documents and loan papers, industrial finance theme, metallic blue and gold palette, no people, ultra high resolution"
  },
  {
    title: "Lines of Credit",
    fileName: "course-lines-of-credit.jpg",
    prompt: "Credit line visualization with flowing financial data streams and business documents, dynamic credit flow concept, navy blue and gold design, no people, ultra high resolution"
  },
  {
    title: "Invoice Factoring",
    fileName: "course-invoice-factoring.jpg",
    prompt: "Invoice documents with cash flow arrows and factoring process visualization, clean business finance design, blue and green color scheme, no people, ultra high resolution"
  },
  {
    title: "Merchant Cash Advances",
    fileName: "course-merchant-cash-advances.jpg",
    prompt: "Point of sale systems with cash advance documents and merchant processing imagery, modern retail finance theme, blue and silver tones, no people, ultra high resolution"
  },
  {
    title: "Asset-Based Lending",
    fileName: "course-asset-based-lending.jpg",
    prompt: "Business assets including inventory and equipment with loan collateral documents, asset finance visualization, dark blue and gold colors, no people, ultra high resolution"
  },
  {
    title: "Construction Loans",
    fileName: "course-construction-loans.jpg",
    prompt: "Construction site blueprints with financing documents and building progress charts, construction finance theme, steel blue and orange accents, no people, ultra high resolution"
  },
  {
    title: "Franchise Financing",
    fileName: "course-franchise-financing.jpg",
    prompt: "Franchise business model diagrams with financing documents and growth charts, franchise finance concept, royal blue and gold design, no people, ultra high resolution"
  },
  {
    title: "Working Capital",
    fileName: "course-working-capital.jpg",
    prompt: "Cash flow cycles and working capital charts with business documents, operational finance visualization, navy blue and green palette, no people, ultra high resolution"
  },
  {
    title: "Healthcare Financing",
    fileName: "course-healthcare-financing.jpg",
    prompt: "Medical facility financing with healthcare equipment and loan documents, healthcare finance theme, medical blue and white colors, no people, ultra high resolution"
  },
  {
    title: "Restaurant Financing",
    fileName: "course-restaurant-financing.jpg",
    prompt: "Restaurant business financing with POS systems and loan documents, food service finance theme, warm blue and gold tones, no people, ultra high resolution"
  },
  {
    title: "Bridge Loans",
    fileName: "course-bridge-loans.jpg",
    prompt: "Financial bridge concept with temporary financing documents and transition imagery, bridge loan visualization, steel blue and silver design, no people, ultra high resolution"
  },
  {
    title: "Term Loans",
    fileName: "course-term-loans.jpg",
    prompt: "Long-term financing documents with business growth timeline and loan terms visualization, structured finance theme, deep blue and gold colors, no people, ultra high resolution"
  },
  {
    title: "Business Acquisition",
    fileName: "course-business-acquisition.jpg",
    prompt: "Merger and acquisition documents with business valuation charts and financing papers, M&A finance theme, corporate blue and gold palette, no people, ultra high resolution"
  }
];

export const generateCourseImage = async (courseData: CourseImageData): Promise<string | null> => {
  try {
    console.log(`Generating image for ${courseData.title}...`);
    
    const { data, error } = await supabase.functions.invoke('generate-course-image', {
      body: { prompt: courseData.prompt }
    });

    if (error) {
      console.error('Error generating image:', error);
      toast.error(`Failed to generate image for ${courseData.title}`);
      return null;
    }

    if (!data?.image) {
      console.error('No image data received');
      toast.error(`No image data received for ${courseData.title}`);
      return null;
    }

    return data.image;
  } catch (error) {
    console.error('Error in generateCourseImage:', error);
    toast.error(`Error generating image for ${courseData.title}`);
    return null;
  }
};

export const generateAllCourseImages = async (): Promise<void> => {
  toast.info("Starting course image generation...");
  
  let successCount = 0;
  let failureCount = 0;

  for (const courseData of courseImagePrompts) {
    try {
      const imageBase64 = await generateCourseImage(courseData);
      
      if (imageBase64) {
        // Convert base64 to blob
        const response = await fetch(imageBase64);
        const blob = await response.blob();
        
        // Here you would typically upload to Supabase storage or save the file
        // For now, we'll just log success
        console.log(`✅ Generated image for ${courseData.title}`);
        successCount++;
      } else {
        failureCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to generate image for ${courseData.title}:`, error);
      failureCount++;
    }

    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (successCount > 0) {
    toast.success(`Successfully generated ${successCount} course images!`);
  }
  
  if (failureCount > 0) {
    toast.error(`Failed to generate ${failureCount} course images.`);
  }
};