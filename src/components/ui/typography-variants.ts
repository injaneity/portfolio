import { cva } from 'class-variance-authority';

export const typographyVariants = cva(
  // Base styles
  "text-left",
  {
    variants: {
      variant: {
        title: [
          "text-[42px] leading-tight tracking-tight font-bold",
          "font-['Sohne_Black',_system-ui,_sans-serif]",
        ],
        h2: [
          "text-[36px] leading-tight tracking-tight font-bold",
          "font-['Sohne_Bold',_system-ui,_sans-serif]",
        ],
        h3: [
          "text-[24px] leading-tight tracking-tight font-bold",
          "font-['Sohne_Medium',_system-ui,_sans-serif]",
        ],
        body: [
          "text-[20px] leading-relaxed",
          "font-['Source_Serif_Pro',_Georgia,_Cambria,_'Times_New_Roman',_Times,_serif]",
        ],
        caption: [
          "text-[14px] leading-normal",
          "font-['Sohne_Regular',_system-ui,_sans-serif]",
        ],
      },
    },
    defaultVariants: {
      variant: "body",
    },
  }
);
