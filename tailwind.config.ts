import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{ts,tsx}",
		"./index.html",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '0',
    		screens: {
    			'2xl': '1440px'
    		}
    	},
    	extend: {
    		fontFamily: {
    			sans: [
    				'Roboto',
    				'ui-sans-serif',
    				'system-ui',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'Segoe UI',
    				'Helvetica Neue',
    				'Arial',
    				'Noto Sans',
    				'sans-serif'
    			],
    			mono: [
    				'Roboto Mono',
    				'ui-monospace',
    				'SFMono-Regular',
    				'Menlo',
    				'Monaco',
    				'Consolas',
    				'Liberation Mono',
    				'Courier New',
    				'monospace'
    			],
    			inter: [
    				'Inter"',
    				'system-ui',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'Segoe UI"',
    				'Roboto',
    				'sans-serif'
    			],
    			playfair: [
    				'Playfair Display"',
    				'Georgia',
    				'serif'
    			],
    			carbon: [
    				'IBM Plex Sans"',
    				'Helvetica Neue"',
    				'Arial',
    				'sans-serif'
    			],
    			serif: [
    				'Libre Caslon Text',
    				'ui-serif',
    				'Georgia',
    				'Cambria',
    				'Times New Roman',
    				'Times',
    				'serif'
    			]
    		},
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))',
    				hover: 'hsl(var(--primary-hover))',
    				muted: 'hsl(var(--primary-muted))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))',
    				hover: 'hsl(var(--secondary-hover))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			'halo-navy': 'hsl(var(--halo-navy))',
    			'halo-orange': 'hsl(var(--halo-orange))',
    			'halo-light-blue': 'hsl(var(--halo-light-blue))',
    			'duke-blue': 'hsl(var(--duke-blue))',
    			'enterprise-blue': 'hsl(var(--enterprise-blue))',
    			'navy-blue': 'hsl(var(--navy-blue))',
    			navy: {
    				'700': 'hsl(var(--navy-700))',
    				'800': 'hsl(var(--navy-800))',
    				'900': 'hsl(var(--navy-900))'
    			},
    			carbon: {
    				dashboard: 'hsl(var(--carbon-dashboard-bg))',
    				widget: 'hsl(var(--carbon-widget-bg))',
    				border: 'hsl(var(--carbon-widget-border))',
    				hover: 'hsl(var(--carbon-widget-hover))',
    				text: 'hsl(var(--carbon-text-primary))',
    				'text-secondary': 'hsl(var(--carbon-text-secondary))',
    				accent: 'hsl(var(--carbon-accent-blue))',
    				success: 'hsl(var(--carbon-success))',
    				warning: 'hsl(var(--carbon-warning))',
    				danger: 'hsl(var(--carbon-danger))'
    			},
    			'course-card': {
    				DEFAULT: 'hsl(var(--course-card-bg))',
    				foreground: 'hsl(var(--course-card-foreground))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		backgroundImage: {
    			'gradient-primary': 'var(--gradient-primary)',
    			'gradient-success': 'var(--gradient-success)',
    			'gradient-hero': 'var(--gradient-hero)',
    			'gradient-duke': 'var(--gradient-duke)',
    			'gradient-enterprise': 'var(--gradient-enterprise)'
    		},
    		boxShadow: {
    			card: 'var(--shadow-card)',
    			elevated: 'var(--shadow-elevated)',
    			hero: 'var(--shadow-hero)',
    			elegant: 'var(--shadow-elegant)'
    		},
    		transitionTimingFunction: {
    			smooth: 'var(--transition-smooth)',
    			spring: 'var(--transition-spring)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'fade-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(10px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'scale-in': {
    				'0%': {
    					transform: 'scale(0.95)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'scale(1)',
    					opacity: '1'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fade-in 0.3s ease-out',
    			'scale-in': 'scale-in 0.2s ease-out',
    			pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			'pulse-extra-slow': 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
