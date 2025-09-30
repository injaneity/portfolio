import { cva } from 'class-variance-authority';

export const typographyVariants = cva(
  // Base styles
  "text-left",
  {
    variants: {
      variant: {
        title: [
          "text-[42px] leading-tight tracking-tight text-center font-semibold",
          "font-['Source_Serif_Pro',_Georgia,_Cambria,_'Times_New_Roman',_Times,_serif]",
          "typography-title",
        ],
        h2: [
          "text-[36px] leading-tight tracking-tight",
          "font-sohne-bold",
          "typography-h2",
        ],
        h3: [
          "text-[24px] leading-tight tracking-tight",
          "font-sohne-medium",
          "typography-h3",
        ],
        body: [
          "text-[20px] leading-relaxed text-justify",
          "font-['Source_Serif_Pro',_Georgia,_Cambria,_'Times_New_Roman',_Times,_serif]",
          "typography-body",
        ],
        caption: [
          "text-[14px] leading-normal",
          "font-sohne-regular",
          "typography-caption",
        ],
      },
    },
    defaultVariants: {
      variant: "body",
    },
  }
);

// Function to get CSS class name for textarea styling
export const getTypographyClass = (content: string): string => {
  const trimmedContent = content.trim();
  const firstLine = trimmedContent.split('\n')[0].trim();
  
  if (firstLine.startsWith('# ')) {
    return 'typography-title';
  } else if (firstLine.startsWith('## ')) {
    return 'typography-h2';
  } else if (firstLine.startsWith('### ')) {
    return 'typography-h3';
  } else {
    return 'typography-body';
  }
};
