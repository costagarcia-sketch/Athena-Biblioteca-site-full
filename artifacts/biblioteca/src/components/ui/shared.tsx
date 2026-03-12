import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// === BUTTON ===
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
      outline: "border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-primary hover:border-primary/50",
      ghost: "hover:bg-accent/10 text-foreground hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    };
    const sizes = {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-4 text-sm",
      lg: "h-14 px-8 text-lg",
      icon: "h-11 w-11 flex items-center justify-center p-0",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// === INPUT ===
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// === CARD ===
export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card text-card-foreground shadow-lg shadow-black/5 overflow-hidden backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

// === BADGE ===
export function Badge({ className, variant = "default", children }: { className?: string, variant?: "default" | "success" | "warning" | "destructive" | "outline", children: React.ReactNode }) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    outline: "border-border text-foreground",
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
      {children}
    </div>
  );
}

// === MODAL / DIALOG ===
export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-50 w-full max-w-lg transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl transition-all border border-border"
          >
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <h3 className="text-xl font-display font-semibold text-foreground">{title}</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// === TABLE ===
export function Table({ children }: { children: React.ReactNode }) {
  return <div className="w-full overflow-auto"><table className="w-full caption-bottom text-sm">{children}</table></div>;
}
export function Th({ children, className }: { children: React.ReactNode, className?: string }) {
  return <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground border-b", className)}>{children}</th>;
}
export function Td({ children, className }: { children: React.ReactNode, className?: string }) {
  return <td className={cn("p-4 align-middle border-b border-border/50", className)}>{children}</td>;
}
export function Tr({ children, className }: { children: React.ReactNode, className?: string }) {
  return <tr className={cn("hover:bg-muted/50 transition-colors data-[state=selected]:bg-muted", className)}>{children}</tr>;
}
