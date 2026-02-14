import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../utils"
import { Loader2 } from "lucide-react"

const buttonVariants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
}

const Button = React.forwardRef(({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    isLoading = false,
    children,
    ...props
}, ref) => {
    const Comp = motion.button

    const sizeClasses = {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
    }

    return (
        <Comp
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                buttonVariants[variant],
                sizeClasses[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Comp>
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
