import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { typographyVariants } from './typography-variants';

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  children: React.ReactNode;
  asChild?: boolean;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, children, asChild = false, ...props }, ref) => {
    if (asChild) {
      return <>{children}</>;
    }

    const baseClassName = cn(typographyVariants({ variant, className }));

    // Render the appropriate element based on variant
    switch (variant) {
      case 'title':
        return (
          <h1 className={baseClassName} ref={ref as React.Ref<HTMLHeadingElement>} {...props}>
            {children}
          </h1>
        );
      case 'h2':
        return (
          <h2 className={baseClassName} ref={ref as React.Ref<HTMLHeadingElement>} {...props}>
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 className={baseClassName} ref={ref as React.Ref<HTMLHeadingElement>} {...props}>
            {children}
          </h3>
        );
      case 'caption':
        return (
          <span className={baseClassName} ref={ref as React.Ref<HTMLSpanElement>} {...props}>
            {children}
          </span>
        );
      case 'body':
      default:
        return (
          <p className={baseClassName} ref={ref as React.Ref<HTMLParagraphElement>} {...props}>
            {children}
          </p>
        );
    }
  }
);

Typography.displayName = "Typography";

export { Typography };
